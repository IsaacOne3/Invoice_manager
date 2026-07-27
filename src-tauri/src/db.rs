use rusqlite::{params, Connection, OptionalExtension};
use rust_decimal::{Decimal, RoundingStrategy};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fmt::{Display, Formatter};
use std::path::Path;
use std::str::FromStr;
use std::sync::Mutex;
use uuid::Uuid;

const SCHEMA_VERSION: i64 = 2;

#[derive(Debug)]
pub enum DbError {
    Sqlite(rusqlite::Error),
    Json(serde_json::Error),
    Decimal(String),
    Validation(String),
}

impl Display for DbError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(f, "SQLite error: {error}"),
            Self::Json(error) => write!(f, "JSON error: {error}"),
            Self::Decimal(value) => write!(f, "Invalid decimal value: {value}"),
            Self::Validation(message) => write!(f, "Validation error: {message}"),
        }
    }
}

impl std::error::Error for DbError {}
impl From<rusqlite::Error> for DbError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}
impl From<serde_json::Error> for DbError {
    fn from(value: serde_json::Error) -> Self {
        Self::Json(value)
    }
}

pub type DbResult<T> = Result<T, DbError>;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Company {
    pub id: String,
    pub legal_name: String,
    pub trading_name: Option<String>,
    pub activity_label: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub tax_identifiers: Option<String>,
    pub registration_identifiers: Option<String>,
    pub bank_details: Option<String>,
    #[serde(default)]
    pub logo_asset_id: Option<String>,
    #[serde(default)]
    pub custom_identifiers: Vec<CustomIdentifier>,
    #[serde(default)]
    pub default_layout_id: Option<String>,
    pub default_template_id: Option<String>,
    pub default_vat_profile_id: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CustomIdentifier {
    pub id: String,
    pub label: String,
    pub value: String,
    pub sort_order: i64,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Client {
    pub id: String,
    pub name: String,
    pub address: Option<String>,
    pub identification_number: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DocumentType {
    pub id: String,
    pub name: String,
    pub printed_title: String,
    pub code: String,
    pub numbering_prefix: Option<String>,
    pub numbering_mode: String,
    pub allow_manual_number: bool,
    pub show_vat: bool,
    pub show_amount_in_words: bool,
    pub default_note: Option<String>,
    #[serde(default)]
    pub default_layout_id: Option<String>,
    pub required_client_fields: Vec<String>,
    pub required_final_fields: Vec<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LayoutBlock {
    pub id: String,
    pub block_type: String,
    pub region: String,
    pub sort_order: i64,
    pub is_visible: bool,
    pub label_text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Layout {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub version_id: String,
    pub version_number: i64,
    pub blocks: Vec<LayoutBlock>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Unit {
    pub id: String,
    pub label: String,
    pub abbreviation: String,
    pub is_active: bool,
    pub sort_order: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DocumentItem {
    pub id: String,
    pub sort_order: i64,
    pub description: String,
    pub quantity: String,
    pub unit_snapshot: Option<Value>,
    pub unit_price_ht: Option<String>,
    pub line_total_ht: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommercialDocument {
    pub id: String,
    pub internal_draft_reference: String,
    pub status: String,
    pub document_type_snapshot: Value,
    pub company_snapshot: Value,
    pub client_snapshot: Value,
    pub official_number: Option<String>,
    pub issue_date: Option<String>,
    pub place: Option<String>,
    pub reference: Option<String>,
    pub note: Option<String>,
    pub vat_rate: String,
    pub source_asset_id: Option<String>,
    pub currency_code: String,
    pub total_ht: String,
    pub vat_amount: String,
    pub total_ttc: String,
    pub layout_snapshot: Option<Value>,
    pub items: Vec<DocumentItem>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DraftInput {
    pub id: Option<String>,
    pub internal_draft_reference: Option<String>,
    pub document_type_snapshot: Value,
    pub company_snapshot: Value,
    pub client_snapshot: Value,
    pub official_number: Option<String>,
    pub issue_date: Option<String>,
    pub place: Option<String>,
    pub reference: Option<String>,
    pub note: Option<String>,
    pub vat_rate: String,
    pub source_asset_id: Option<String>,
    pub currency_code: String,
    #[serde(default)]
    pub layout_snapshot: Option<Value>,
    pub items: Vec<DraftItemInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DraftItemInput {
    pub id: Option<String>,
    pub sort_order: i64,
    pub description: String,
    pub quantity: String,
    pub unit_snapshot: Option<Value>,
    pub unit_price_ht: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Totals {
    pub total_ht: String,
    pub vat_amount: String,
    pub total_ttc: String,
}

pub struct Database {
    connection: Mutex<Connection>,
}

impl Database {
    pub fn open(path: impl AsRef<Path>) -> DbResult<Self> {
        let connection = Connection::open(path)?;
        connection.pragma_update(None, "foreign_keys", "ON")?;
        let database = Self {
            connection: Mutex::new(connection),
        };
        database.migrate()?;
        Ok(database)
    }

    pub fn in_memory() -> DbResult<Self> {
        let connection = Connection::open_in_memory()?;
        connection.pragma_update(None, "foreign_keys", "ON")?;
        let database = Self {
            connection: Mutex::new(connection),
        };
        database.migrate()?;
        Ok(database)
    }

    pub fn migrate(&self) -> DbResult<()> {
        let connection = self
            .connection
            .lock()
            .map_err(|_| DbError::Validation("database lock poisoned".into()))?;
        connection.execute_batch("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);")?;
        let current: i64 = connection.query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get(0),
        )?;
        if current < 1 {
            let transaction = connection.unchecked_transaction()?;
            transaction.execute_batch(SCHEMA_V1)?;
            transaction.execute("INSERT INTO schema_migrations(version, applied_at) VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))", [])?;
            transaction.commit()?;
        }
        let current: i64 = connection.query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get(0),
        )?;
        if current < SCHEMA_VERSION {
            let transaction = connection.unchecked_transaction()?;
            transaction.execute_batch(SCHEMA_V2)?;
            transaction.execute("INSERT INTO schema_migrations(version, applied_at) VALUES (2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))", [])?;
            transaction.commit()?;
        }
        Ok(())
    }

    pub fn schema_version(&self) -> DbResult<i64> {
        let connection = self
            .connection
            .lock()
            .map_err(|_| DbError::Validation("database lock poisoned".into()))?;
        Ok(connection.query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get(0),
        )?)
    }

    pub fn create_company(&self, mut company: Company) -> DbResult<Company> {
        validate_non_empty("company legal name", &company.legal_name)?;
        assign_identity(
            &mut company.id,
            &mut company.created_at,
            &mut company.updated_at,
        );
        let connection = self.connection.lock().map_err(lock_error)?;
        connection.execute("INSERT INTO companies (id, legal_name, trading_name, activity_label, address, city, phone, email, tax_identifiers, registration_identifiers, bank_details, logo_asset_id, custom_identifiers, default_layout_id, default_template_id, default_vat_profile_id, is_active, created_at, updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)", params![company.id, company.legal_name, company.trading_name, company.activity_label, company.address, company.city, company.phone, company.email, company.tax_identifiers, company.registration_identifiers, company.bank_details, company.logo_asset_id, serde_json::to_string(&company.custom_identifiers)?, company.default_layout_id, company.default_template_id, company.default_vat_profile_id, company.is_active, company.created_at, company.updated_at])?;
        Ok(company)
    }

    pub fn list_companies(&self, active_only: bool) -> DbResult<Vec<Company>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let mut statement = connection.prepare(&format!("SELECT id, legal_name, trading_name, activity_label, address, city, phone, email, tax_identifiers, registration_identifiers, bank_details, logo_asset_id, custom_identifiers, default_layout_id, default_template_id, default_vat_profile_id, is_active, created_at, updated_at FROM companies {} ORDER BY legal_name", if active_only { "WHERE is_active = 1" } else { "" }))?;
        let rows = statement
            .query_map([], company_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rows)
    }

    pub fn update_company(&self, company: &Company) -> DbResult<()> {
        validate_non_empty("company legal name", &company.legal_name)?;
        let connection = self.connection.lock().map_err(lock_error)?;
        let changed = connection.execute("UPDATE companies SET legal_name=?2, trading_name=?3, activity_label=?4, address=?5, city=?6, phone=?7, email=?8, tax_identifiers=?9, registration_identifiers=?10, bank_details=?11, logo_asset_id=?12, custom_identifiers=?13, default_layout_id=?14, default_template_id=?15, default_vat_profile_id=?16, is_active=?17, updated_at=?18 WHERE id=?1", params![company.id, company.legal_name, company.trading_name, company.activity_label, company.address, company.city, company.phone, company.email, company.tax_identifiers, company.registration_identifiers, company.bank_details, company.logo_asset_id, serde_json::to_string(&company.custom_identifiers)?, company.default_layout_id, company.default_template_id, company.default_vat_profile_id, company.is_active, utc_now()])?;
        if changed != 1 {
            return Err(DbError::Validation("company was not found".into()));
        }
        Ok(())
    }

    pub fn create_client(&self, mut client: Client) -> DbResult<Client> {
        validate_non_empty("client name", &client.name)?;
        assign_identity(
            &mut client.id,
            &mut client.created_at,
            &mut client.updated_at,
        );
        let connection = self.connection.lock().map_err(lock_error)?;
        connection.execute("INSERT INTO clients (id,name,address,identification_number,phone,email,is_active,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)", params![client.id, client.name, client.address, client.identification_number, client.phone, client.email, client.is_active, client.created_at, client.updated_at])?;
        Ok(client)
    }

    pub fn list_clients(&self, active_only: bool) -> DbResult<Vec<Client>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let mut statement = connection.prepare(&format!("SELECT id,name,address,identification_number,phone,email,is_active,created_at,updated_at FROM clients {} ORDER BY name", if active_only { "WHERE is_active = 1" } else { "" }))?;
        let rows = statement
            .query_map([], client_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rows)
    }

    pub fn update_client(&self, client: &Client) -> DbResult<()> {
        validate_non_empty("client name", &client.name)?;
        let connection = self.connection.lock().map_err(lock_error)?;
        let changed = connection.execute("UPDATE clients SET name=?2, address=?3, identification_number=?4, phone=?5, email=?6, is_active=?7, updated_at=?8 WHERE id=?1", params![client.id, client.name, client.address, client.identification_number, client.phone, client.email, client.is_active, utc_now()])?;
        if changed != 1 {
            return Err(DbError::Validation("client was not found".into()));
        }
        Ok(())
    }

    pub fn create_document_type(&self, mut definition: DocumentType) -> DbResult<DocumentType> {
        validate_non_empty("document type name", &definition.name)?;
        validate_non_empty("document type code", &definition.code)?;
        assign_identity(
            &mut definition.id,
            &mut definition.created_at,
            &mut definition.updated_at,
        );
        let client_fields = serde_json::to_string(&definition.required_client_fields)?;
        let final_fields = serde_json::to_string(&definition.required_final_fields)?;
        let connection = self.connection.lock().map_err(lock_error)?;
        connection.execute("INSERT INTO document_types (id,name,printed_title,code,numbering_prefix,numbering_mode,allow_manual_number,show_vat,show_amount_in_words,default_note,default_layout_id,required_client_fields,required_final_fields,is_active,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16)", params![definition.id, definition.name, definition.printed_title, definition.code, definition.numbering_prefix, definition.numbering_mode, definition.allow_manual_number, definition.show_vat, definition.show_amount_in_words, definition.default_note, definition.default_layout_id, client_fields, final_fields, definition.is_active, definition.created_at, definition.updated_at])?;
        Ok(definition)
    }

    pub fn list_document_types(&self, active_only: bool) -> DbResult<Vec<DocumentType>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let mut statement = connection.prepare(&format!("SELECT id,name,printed_title,code,numbering_prefix,numbering_mode,allow_manual_number,show_vat,show_amount_in_words,default_note,default_layout_id,required_client_fields,required_final_fields,is_active,created_at,updated_at FROM document_types {} ORDER BY name", if active_only { "WHERE is_active = 1" } else { "" }))?;
        let rows = statement
            .query_map([], document_type_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rows)
    }

    pub fn update_document_type(&self, definition: &DocumentType) -> DbResult<()> {
        validate_non_empty("document type name", &definition.name)?;
        validate_non_empty("document type code", &definition.code)?;
        let connection = self.connection.lock().map_err(lock_error)?;
        let changed = connection.execute("UPDATE document_types SET name=?2, printed_title=?3, code=?4, numbering_prefix=?5, numbering_mode=?6, allow_manual_number=?7, show_vat=?8, show_amount_in_words=?9, default_note=?10, default_layout_id=?11, required_client_fields=?12, required_final_fields=?13, is_active=?14, updated_at=?15 WHERE id=?1", params![definition.id, definition.name, definition.printed_title, definition.code, definition.numbering_prefix, definition.numbering_mode, definition.allow_manual_number, definition.show_vat, definition.show_amount_in_words, definition.default_note, definition.default_layout_id, serde_json::to_string(&definition.required_client_fields)?, serde_json::to_string(&definition.required_final_fields)?, definition.is_active, utc_now()])?;
        if changed != 1 {
            return Err(DbError::Validation("document type was not found".into()));
        }
        Ok(())
    }

    pub fn save_layout(&self, mut layout: Layout) -> DbResult<Layout> {
        validate_non_empty("layout name", &layout.name)?;
        validate_layout_blocks(&layout.blocks)?;
        let connection = self.connection.lock().map_err(lock_error)?;
        let transaction = connection.unchecked_transaction()?;
        let now = utc_now();
        if layout.id.is_empty() {
            layout.id = Uuid::new_v4().to_string();
            layout.version_id = Uuid::new_v4().to_string();
            layout.version_number = 1;
            layout.created_at = now.clone();
            layout.updated_at = now.clone();
            transaction.execute("INSERT INTO layouts (id,name,description,is_active,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6)", params![layout.id, layout.name, layout.description, layout.is_active, layout.created_at, layout.updated_at])?;
            transaction.execute("INSERT INTO layout_versions (id,layout_id,version_number,status,blocks_json,created_at,updated_at) VALUES (?1,?2,1,'draft',?3,?4,?5)", params![layout.version_id, layout.id, serde_json::to_string(&layout.blocks)?, layout.created_at, layout.updated_at])?;
        } else {
            let next_version: i64 = transaction.query_row("SELECT COALESCE(MAX(version_number), 0) + 1 FROM layout_versions WHERE layout_id = ?1", [&layout.id], |row| row.get(0))?;
            layout.version_id = Uuid::new_v4().to_string();
            layout.version_number = next_version;
            layout.updated_at = now.clone();
            transaction.execute(
                "UPDATE layouts SET name=?2,description=?3,is_active=?4,updated_at=?5 WHERE id=?1",
                params![
                    layout.id,
                    layout.name,
                    layout.description,
                    layout.is_active,
                    layout.updated_at
                ],
            )?;
            transaction.execute("INSERT INTO layout_versions (id,layout_id,version_number,status,blocks_json,created_at,updated_at) VALUES (?1,?2,?3,'draft',?4,COALESCE((SELECT created_at FROM layouts WHERE id=?2),?5),?5)", params![layout.version_id, layout.id, layout.version_number, serde_json::to_string(&layout.blocks)?, now])?;
        }
        transaction.commit()?;
        Ok(layout)
    }

    pub fn list_layouts(&self) -> DbResult<Vec<Layout>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let mut statement = connection.prepare("SELECT l.id,l.name,l.description,l.is_active,v.id,v.version_number,v.blocks_json,l.created_at,l.updated_at FROM layouts l JOIN layout_versions v ON v.layout_id=l.id AND v.version_number=(SELECT MAX(version_number) FROM layout_versions WHERE layout_id=l.id) WHERE l.is_active=1 ORDER BY l.name")?;
        let layouts = statement
            .query_map([], layout_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(layouts)
    }

    pub fn get_layout(&self, id: &str) -> DbResult<Option<Layout>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        Ok(connection.query_row("SELECT l.id,l.name,l.description,l.is_active,v.id,v.version_number,v.blocks_json,l.created_at,l.updated_at FROM layouts l JOIN layout_versions v ON v.layout_id=l.id AND v.version_number=(SELECT MAX(version_number) FROM layout_versions WHERE layout_id=l.id) WHERE l.id=?1", [id], layout_from_row).optional()?)
    }

    pub fn assign_company_layout(&self, company_id: &str, layout_id: Option<&str>) -> DbResult<()> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let changed = connection.execute(
            "UPDATE companies SET default_layout_id=?2,updated_at=?3 WHERE id=?1",
            params![company_id, layout_id, utc_now()],
        )?;
        if changed != 1 {
            return Err(DbError::Validation("company was not found".into()));
        }
        Ok(())
    }

    pub fn create_unit(&self, mut unit: Unit) -> DbResult<Unit> {
        validate_non_empty("unit label", &unit.label)?;
        validate_non_empty("unit abbreviation", &unit.abbreviation)?;
        if unit.id.is_empty() {
            unit.id = Uuid::new_v4().to_string();
        }
        let connection = self.connection.lock().map_err(lock_error)?;
        connection.execute("INSERT INTO units (id,label,abbreviation,is_active,sort_order) VALUES (?1,?2,?3,?4,?5)", params![unit.id, unit.label, unit.abbreviation, unit.is_active, unit.sort_order])?;
        Ok(unit)
    }

    pub fn list_units(&self, active_only: bool) -> DbResult<Vec<Unit>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let mut statement = connection.prepare(&format!("SELECT id,label,abbreviation,is_active,sort_order FROM units {} ORDER BY sort_order,label", if active_only { "WHERE is_active = 1" } else { "" }))?;
        let rows = statement
            .query_map([], unit_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(rows)
    }

    pub fn update_unit(&self, unit: &Unit) -> DbResult<()> {
        validate_non_empty("unit label", &unit.label)?;
        validate_non_empty("unit abbreviation", &unit.abbreviation)?;
        let connection = self.connection.lock().map_err(lock_error)?;
        let changed = connection.execute(
            "UPDATE units SET label=?2, abbreviation=?3, is_active=?4, sort_order=?5 WHERE id=?1",
            params![
                unit.id,
                unit.label,
                unit.abbreviation,
                unit.is_active,
                unit.sort_order
            ],
        )?;
        if changed != 1 {
            return Err(DbError::Validation("unit was not found".into()));
        }
        Ok(())
    }

    pub fn save_draft(&self, input: DraftInput) -> DbResult<CommercialDocument> {
        validate_draft(&input)?;
        let id = input
            .id
            .clone()
            .unwrap_or_else(|| Uuid::new_v4().to_string());
        let reference = input
            .internal_draft_reference
            .clone()
            .unwrap_or_else(|| format!("DRAFT-{}", &id[..8]));
        let now = utc_now();
        let totals = calculate_totals(&input.items, &input.vat_rate)?;
        let connection = self.connection.lock().map_err(lock_error)?;
        let transaction = connection.unchecked_transaction()?;
        let existing: Option<(String, String)> = transaction
            .query_row(
                "SELECT created_at, internal_draft_reference FROM documents WHERE id = ?1",
                [&id],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .optional()?;
        let created_at = existing
            .as_ref()
            .map(|value| value.0.clone())
            .unwrap_or_else(|| now.clone());
        transaction.execute("INSERT INTO documents (id,internal_draft_reference,status,document_type_snapshot,company_snapshot,client_snapshot,official_number,issue_date,place,reference,note,vat_rate,source_asset_id,currency_code,total_ht,vat_amount,total_ttc,layout_snapshot,created_at,updated_at,finalized_at) VALUES (?1,?2,'Draft',?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,NULL) ON CONFLICT(id) DO UPDATE SET internal_draft_reference=excluded.internal_draft_reference, document_type_snapshot=excluded.document_type_snapshot, company_snapshot=excluded.company_snapshot, client_snapshot=excluded.client_snapshot, official_number=excluded.official_number, issue_date=excluded.issue_date, place=excluded.place, reference=excluded.reference, note=excluded.note, vat_rate=excluded.vat_rate, source_asset_id=excluded.source_asset_id, currency_code=excluded.currency_code, total_ht=excluded.total_ht, vat_amount=excluded.vat_amount, total_ttc=excluded.total_ttc, layout_snapshot=excluded.layout_snapshot, updated_at=excluded.updated_at", params![id, reference, input.document_type_snapshot.to_string(), input.company_snapshot.to_string(), input.client_snapshot.to_string(), input.official_number, input.issue_date, input.place, input.reference, input.note, input.vat_rate, input.source_asset_id, input.currency_code, totals.total_ht, totals.vat_amount, totals.total_ttc, input.layout_snapshot.as_ref().map(Value::to_string), created_at, now])?;
        transaction.execute("DELETE FROM document_items WHERE document_id = ?1", [&id])?;
        for item in &input.items {
            let item_id = item
                .id
                .clone()
                .unwrap_or_else(|| Uuid::new_v4().to_string());
            let price = item.unit_price_ht.clone();
            let line_total = price
                .as_ref()
                .map(|value| calculate_line_total(&item.quantity, value))
                .transpose()?;
            transaction.execute("INSERT INTO document_items (id,document_id,sort_order,description,quantity,unit_snapshot,unit_price_ht,line_total_ht,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?9)", params![item_id, id, item.sort_order, item.description, item.quantity, item.unit_snapshot.as_ref().map(Value::to_string), price, line_total, now])?;
        }
        transaction.commit()?;
        drop(connection);
        self.get_document(&id)?
            .ok_or_else(|| DbError::Validation("saved draft could not be reloaded".into()))
    }

    pub fn get_document(&self, id: &str) -> DbResult<Option<CommercialDocument>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let document = connection.query_row("SELECT id,internal_draft_reference,status,document_type_snapshot,company_snapshot,client_snapshot,official_number,issue_date,place,reference,note,vat_rate,source_asset_id,currency_code,total_ht,vat_amount,total_ttc,layout_snapshot,created_at,updated_at FROM documents WHERE id = ?1", [id], document_from_row).optional()?;
        let Some(mut document) = document else {
            return Ok(None);
        };
        let mut statement = connection.prepare("SELECT id,sort_order,description,quantity,unit_snapshot,unit_price_ht,line_total_ht FROM document_items WHERE document_id = ?1 ORDER BY sort_order")?;
        document.items = statement
            .query_map([id], item_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(Some(document))
    }

    pub fn list_documents(&self) -> DbResult<Vec<CommercialDocument>> {
        let connection = self.connection.lock().map_err(lock_error)?;
        let mut statement = connection.prepare("SELECT id,internal_draft_reference,status,document_type_snapshot,company_snapshot,client_snapshot,official_number,issue_date,place,reference,note,vat_rate,source_asset_id,currency_code,total_ht,vat_amount,total_ttc,layout_snapshot,created_at,updated_at FROM documents ORDER BY updated_at DESC")?;
        let documents = statement
            .query_map([], document_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(documents)
    }
}

fn lock_error<T>(_: std::sync::PoisonError<T>) -> DbError {
    DbError::Validation("database lock poisoned".into())
}
fn validate_non_empty(field: &str, value: &str) -> DbResult<()> {
    if value.trim().is_empty() {
        Err(DbError::Validation(format!("{field} is required")))
    } else {
        Ok(())
    }
}

fn validate_layout_blocks(blocks: &[LayoutBlock]) -> DbResult<()> {
    const SUPPORTED: &[&str] = &[
        "company_header",
        "document_identity",
        "client",
        "items_table",
        "totals",
        "notes",
        "footer",
    ];
    for block in blocks {
        if !SUPPORTED.contains(&block.block_type.as_str()) {
            return Err(DbError::Validation(format!(
                "unsupported layout block: {}",
                block.block_type
            )));
        }
        if block.sort_order < 0 {
            return Err(DbError::Validation(
                "layout block order cannot be negative".into(),
            ));
        }
    }
    Ok(())
}
fn assign_identity(id: &mut String, created_at: &mut String, updated_at: &mut String) {
    if id.is_empty() {
        *id = Uuid::new_v4().to_string();
    }
    let now = utc_now();
    if created_at.is_empty() {
        *created_at = now.clone();
    }
    *updated_at = now;
}
fn utc_now() -> String {
    chrono::Utc::now().to_rfc3339()
}
fn decimal(value: &str) -> DbResult<Decimal> {
    Decimal::from_str(value).map_err(|_| DbError::Decimal(value.into()))
}
fn money(value: Decimal) -> String {
    format!(
        "{:.2}",
        value.round_dp_with_strategy(2, RoundingStrategy::MidpointAwayFromZero)
    )
}
fn calculate_line_total(quantity: &str, price: &str) -> DbResult<String> {
    Ok(money(decimal(quantity)? * decimal(price)?))
}

pub fn calculate_totals(items: &[DraftItemInput], vat_rate: &str) -> DbResult<Totals> {
    let mut total_ht = Decimal::ZERO;
    for item in items {
        validate_non_empty("item description", &item.description)?;
        let quantity = decimal(&item.quantity)?;
        if quantity <= Decimal::ZERO {
            return Err(DbError::Validation("item quantity must be positive".into()));
        }
        if let Some(price) = &item.unit_price_ht {
            if decimal(price)? < Decimal::ZERO {
                return Err(DbError::Validation("unit price cannot be negative".into()));
            }
            total_ht += decimal(&calculate_line_total(&item.quantity, price)?)?;
        }
    }
    let vat = total_ht * decimal(vat_rate)? / Decimal::ONE_HUNDRED;
    let total_ht = Decimal::from_str(&money(total_ht))
        .map_err(|_| DbError::Decimal("calculated total".into()))?;
    let vat =
        Decimal::from_str(&money(vat)).map_err(|_| DbError::Decimal("calculated VAT".into()))?;
    Ok(Totals {
        total_ht: money(total_ht),
        vat_amount: money(vat),
        total_ttc: money(total_ht + vat),
    })
}

fn validate_draft(input: &DraftInput) -> DbResult<()> {
    validate_non_empty("currency code", &input.currency_code)?;
    decimal(&input.vat_rate)?;
    if input.document_type_snapshot.is_null() || input.company_snapshot.is_null() {
        return Err(DbError::Validation(
            "company and document type snapshots are required".into(),
        ));
    }
    Ok(())
}

fn company_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Company> {
    Ok(Company {
        id: row.get(0)?,
        legal_name: row.get(1)?,
        trading_name: row.get(2)?,
        activity_label: row.get(3)?,
        address: row.get(4)?,
        city: row.get(5)?,
        phone: row.get(6)?,
        email: row.get(7)?,
        tax_identifiers: row.get(8)?,
        registration_identifiers: row.get(9)?,
        bank_details: row.get(10)?,
        logo_asset_id: row.get(11)?,
        custom_identifiers: serde_json::from_str(&row.get::<_, String>(12)?).unwrap_or_default(),
        default_layout_id: row.get(13)?,
        default_template_id: row.get(14)?,
        default_vat_profile_id: row.get(15)?,
        is_active: row.get(16)?,
        created_at: row.get(17)?,
        updated_at: row.get(18)?,
    })
}
fn client_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Client> {
    Ok(Client {
        id: row.get(0)?,
        name: row.get(1)?,
        address: row.get(2)?,
        identification_number: row.get(3)?,
        phone: row.get(4)?,
        email: row.get(5)?,
        is_active: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}
fn document_type_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<DocumentType> {
    Ok(DocumentType {
        id: row.get(0)?,
        name: row.get(1)?,
        printed_title: row.get(2)?,
        code: row.get(3)?,
        numbering_prefix: row.get(4)?,
        numbering_mode: row.get(5)?,
        allow_manual_number: row.get(6)?,
        show_vat: row.get(7)?,
        show_amount_in_words: row.get(8)?,
        default_note: row.get(9)?,
        default_layout_id: row.get(10)?,
        required_client_fields: serde_json::from_str(&row.get::<_, String>(11)?)
            .unwrap_or_default(),
        required_final_fields: serde_json::from_str(&row.get::<_, String>(12)?).unwrap_or_default(),
        is_active: row.get(13)?,
        created_at: row.get(14)?,
        updated_at: row.get(15)?,
    })
}

fn layout_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Layout> {
    Ok(Layout {
        id: row.get(0)?,
        name: row.get(1)?,
        description: row.get(2)?,
        is_active: row.get(3)?,
        version_id: row.get(4)?,
        version_number: row.get(5)?,
        blocks: serde_json::from_str(&row.get::<_, String>(6)?).unwrap_or_default(),
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}
fn unit_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Unit> {
    Ok(Unit {
        id: row.get(0)?,
        label: row.get(1)?,
        abbreviation: row.get(2)?,
        is_active: row.get(3)?,
        sort_order: row.get(4)?,
    })
}
fn item_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<DocumentItem> {
    Ok(DocumentItem {
        id: row.get(0)?,
        sort_order: row.get(1)?,
        description: row.get(2)?,
        quantity: row.get(3)?,
        unit_snapshot: row
            .get::<_, Option<String>>(4)?
            .map(|value| serde_json::from_str(&value))
            .transpose()
            .unwrap_or(None),
        unit_price_ht: row.get(5)?,
        line_total_ht: row.get(6)?,
    })
}
fn document_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<CommercialDocument> {
    Ok(CommercialDocument {
        id: row.get(0)?,
        internal_draft_reference: row.get(1)?,
        status: row.get(2)?,
        document_type_snapshot: serde_json::from_str(&row.get::<_, String>(3)?)
            .unwrap_or(Value::Null),
        company_snapshot: serde_json::from_str(&row.get::<_, String>(4)?).unwrap_or(Value::Null),
        client_snapshot: serde_json::from_str(&row.get::<_, String>(5)?).unwrap_or(Value::Null),
        official_number: row.get(6)?,
        issue_date: row.get(7)?,
        place: row.get(8)?,
        reference: row.get(9)?,
        note: row.get(10)?,
        vat_rate: row.get(11)?,
        source_asset_id: row.get(12)?,
        currency_code: row.get(13)?,
        total_ht: row.get(14)?,
        vat_amount: row.get(15)?,
        total_ttc: row.get(16)?,
        layout_snapshot: row
            .get::<_, Option<String>>(17)?
            .map(|value| serde_json::from_str(&value))
            .transpose()
            .unwrap_or(None),
        items: Vec::new(),
        created_at: row.get(18)?,
        updated_at: row.get(19)?,
    })
}

const SCHEMA_V1: &str = r#"
CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, legal_name TEXT NOT NULL, trading_name TEXT, activity_label TEXT, address TEXT, city TEXT, phone TEXT, email TEXT, tax_identifiers TEXT, registration_identifiers TEXT, bank_details TEXT, default_template_id TEXT, default_vat_profile_id TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT, identification_number TEXT, phone TEXT, email TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS document_types (id TEXT PRIMARY KEY, name TEXT NOT NULL, printed_title TEXT NOT NULL, code TEXT NOT NULL UNIQUE, numbering_prefix TEXT, numbering_mode TEXT NOT NULL, allow_manual_number INTEGER NOT NULL DEFAULT 0, show_vat INTEGER NOT NULL DEFAULT 1, show_amount_in_words INTEGER NOT NULL DEFAULT 0, default_note TEXT, required_client_fields TEXT NOT NULL DEFAULT '[]', required_final_fields TEXT NOT NULL DEFAULT '[]', is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS units (id TEXT PRIMARY KEY, label TEXT NOT NULL, abbreviation TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, internal_draft_reference TEXT NOT NULL UNIQUE, status TEXT NOT NULL, document_type_snapshot TEXT NOT NULL, company_snapshot TEXT NOT NULL, client_snapshot TEXT NOT NULL, official_number TEXT, issue_date TEXT, place TEXT, reference TEXT, note TEXT, vat_rate TEXT NOT NULL, source_asset_id TEXT, currency_code TEXT NOT NULL, total_ht TEXT NOT NULL, vat_amount TEXT NOT NULL, total_ttc TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, finalized_at TEXT);
CREATE TABLE IF NOT EXISTS document_items (id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE, sort_order INTEGER NOT NULL, description TEXT NOT NULL, quantity TEXT NOT NULL, unit_snapshot TEXT, unit_price_ht TEXT, line_total_ht TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_document_items_document_order ON document_items(document_id, sort_order);
"#;

const SCHEMA_V2: &str = r#"
ALTER TABLE companies ADD COLUMN logo_asset_id TEXT;
ALTER TABLE companies ADD COLUMN custom_identifiers TEXT NOT NULL DEFAULT '[]';
ALTER TABLE companies ADD COLUMN default_layout_id TEXT;
ALTER TABLE document_types ADD COLUMN default_layout_id TEXT;
ALTER TABLE documents ADD COLUMN layout_snapshot TEXT;
CREATE TABLE IF NOT EXISTS layouts (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS layout_versions (id TEXT PRIMARY KEY, layout_id TEXT NOT NULL REFERENCES layouts(id) ON DELETE CASCADE, version_number INTEGER NOT NULL, status TEXT NOT NULL, blocks_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(layout_id, version_number));
CREATE INDEX IF NOT EXISTS idx_layout_versions_layout ON layout_versions(layout_id, version_number);
"#;

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn company() -> Company {
        Company {
            id: String::new(),
            legal_name: "Algerian Services SARL".into(),
            trading_name: None,
            activity_label: Some("Services".into()),
            address: None,
            city: Some("Algiers".into()),
            phone: None,
            email: None,
            tax_identifiers: None,
            registration_identifiers: None,
            bank_details: None,
            logo_asset_id: None,
            custom_identifiers: Vec::new(),
            default_layout_id: None,
            default_template_id: None,
            default_vat_profile_id: None,
            is_active: true,
            created_at: String::new(),
            updated_at: String::new(),
        }
    }
    fn client() -> Client {
        Client {
            id: String::new(),
            name: "Example Client".into(),
            address: None,
            identification_number: None,
            phone: None,
            email: None,
            is_active: true,
            created_at: String::new(),
            updated_at: String::new(),
        }
    }
    fn document_type() -> DocumentType {
        DocumentType {
            id: String::new(),
            name: "Invoice".into(),
            printed_title: "INVOICE".into(),
            code: "INV".into(),
            numbering_prefix: Some("INV".into()),
            numbering_mode: "manual".into(),
            allow_manual_number: true,
            show_vat: true,
            show_amount_in_words: false,
            default_note: None,
            default_layout_id: None,
            required_client_fields: vec!["name".into()],
            required_final_fields: vec!["officialNumber".into()],
            is_active: true,
            created_at: String::new(),
            updated_at: String::new(),
        }
    }
    fn unit() -> Unit {
        Unit {
            id: String::new(),
            label: "Piece".into(),
            abbreviation: "pc".into(),
            is_active: true,
            sort_order: 1,
        }
    }
    fn draft() -> DraftInput {
        DraftInput {
            id: None,
            internal_draft_reference: None,
            document_type_snapshot: json!({"code":"INV"}),
            company_snapshot: json!({"legalName":"Algerian Services SARL"}),
            client_snapshot: json!({"name":"Example Client"}),
            official_number: None,
            issue_date: None,
            place: None,
            reference: None,
            note: None,
            vat_rate: "19".into(),
            source_asset_id: None,
            currency_code: "DZD".into(),
            layout_snapshot: None,
            items: vec![DraftItemInput {
                id: None,
                sort_order: 0,
                description: "Consulting".into(),
                quantity: "1.5".into(),
                unit_snapshot: Some(json!({"abbreviation":"pc"})),
                unit_price_ht: Some("100.10".into()),
            }],
        }
    }

    #[test]
    fn migrations_are_idempotent_and_foreign_keys_are_enabled() {
        let db = Database::in_memory().unwrap();
        db.migrate().unwrap();
        assert_eq!(db.schema_version().unwrap(), 2);
        assert_eq!(db.list_units(true).unwrap().len(), 0);
        let connection = db.connection.lock().unwrap();
        assert_eq!(
            connection
                .query_row("PRAGMA foreign_keys", [], |row| row.get::<_, i64>(0))
                .unwrap(),
            1
        );
    }

    #[test]
    fn configuration_repositories_assign_stable_ids_and_reload() {
        let db = Database::in_memory().unwrap();
        let mut company = db.create_company(company()).unwrap();
        let mut client = db.create_client(client()).unwrap();
        let mut definition = db.create_document_type(document_type()).unwrap();
        let mut unit = db.create_unit(unit()).unwrap();
        assert!(
            !company.id.is_empty()
                && !client.id.is_empty()
                && !definition.id.is_empty()
                && !unit.id.is_empty()
        );
        company.city = Some("Oran".into());
        company.custom_identifiers = vec![CustomIdentifier {
            id: "nif".into(),
            label: "NIF".into(),
            value: "123".into(),
            sort_order: 0,
            is_active: true,
        }];
        client.name = "Updated Client".into();
        definition.printed_title = "UPDATED INVOICE".into();
        unit.abbreviation = "u".into();
        db.update_company(&company).unwrap();
        db.update_client(&client).unwrap();
        db.update_document_type(&definition).unwrap();
        db.update_unit(&unit).unwrap();
        let companies = db.list_companies(true).unwrap();
        let clients = db.list_clients(true).unwrap();
        let definitions = db.list_document_types(true).unwrap();
        let units = db.list_units(true).unwrap();
        assert_eq!(companies[0].id, company.id);
        assert_eq!(companies[0].city, Some("Oran".into()));
        assert_eq!(companies[0].custom_identifiers[0].value, "123");
        assert_eq!(clients[0].name, client.name);
        assert_eq!(definitions[0].printed_title, definition.printed_title);
        assert_eq!(units[0].abbreviation, unit.abbreviation);
        company.is_active = false;
        db.update_company(&company).unwrap();
        assert!(db.list_companies(true).unwrap().is_empty());
        assert_eq!(db.list_companies(false).unwrap().len(), 1);
    }

    #[test]
    fn draft_save_and_load_persists_snapshots_items_and_totals() {
        let db = Database::in_memory().unwrap();
        let mut input = draft();
        input.layout_snapshot = Some(json!({"id":"layout-1","version":1}));
        let saved = db.save_draft(input).unwrap();
        assert_eq!(saved.status, "Draft");
        assert_eq!(saved.items[0].line_total_ht.as_deref(), Some("150.15"));
        assert_eq!(saved.total_ht, "150.15");
        assert_eq!(saved.vat_amount, "28.53");
        assert_eq!(saved.total_ttc, "178.68");
        let reloaded = db.get_document(&saved.id).unwrap().unwrap();
        assert_eq!(reloaded, saved);
        assert_eq!(reloaded.document_type_snapshot["code"], "INV");
        assert_eq!(reloaded.layout_snapshot.as_ref().unwrap()["id"], "layout-1");
    }

    #[test]
    fn layouts_are_versioned_and_can_be_assigned_to_a_company() {
        let db = Database::in_memory().unwrap();
        let company = db.create_company(company()).unwrap();
        let mut layout = Layout {
            id: String::new(),
            name: "Classic invoice".into(),
            description: Some("Controlled first layout".into()),
            is_active: true,
            version_id: String::new(),
            version_number: 0,
            blocks: vec![
                LayoutBlock {
                    id: "company".into(),
                    block_type: "company_header".into(),
                    region: "header".into(),
                    sort_order: 0,
                    is_visible: true,
                    label_text: None,
                },
                LayoutBlock {
                    id: "items".into(),
                    block_type: "items_table".into(),
                    region: "body".into(),
                    sort_order: 1,
                    is_visible: true,
                    label_text: None,
                },
            ],
            created_at: String::new(),
            updated_at: String::new(),
        };
        layout = db.save_layout(layout).unwrap();
        assert_eq!(layout.version_number, 1);
        db.assign_company_layout(&company.id, Some(&layout.id))
            .unwrap();
        let mut next = layout.clone();
        next.blocks[0].is_visible = false;
        let versioned = db.save_layout(next).unwrap();
        assert_eq!(versioned.version_number, 2);
        assert!(!db.get_layout(&layout.id).unwrap().unwrap().blocks[0].is_visible);
        assert_eq!(
            db.list_companies(true).unwrap()[0].default_layout_id,
            Some(layout.id)
        );
    }

    #[test]
    fn empty_draft_can_be_saved_before_item_entry() {
        let db = Database::in_memory().unwrap();
        let mut input = draft();
        input.items.clear();
        let saved = db.save_draft(input).unwrap();
        assert!(saved.items.is_empty());
        assert_eq!(saved.total_ht, "0.00");
        assert_eq!(saved.vat_amount, "0.00");
        assert_eq!(saved.total_ttc, "0.00");
        assert_eq!(db.get_document(&saved.id).unwrap().unwrap(), saved);
    }

    #[test]
    fn first_draft_can_be_created_without_a_client_and_is_listed() {
        let db = Database::in_memory().unwrap();
        let mut input = draft();
        input.client_snapshot = Value::Null;
        input.items.clear();
        let saved = db.save_draft(input).unwrap();
        let listed = db.list_documents().unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].id, saved.id);
        assert!(listed[0].client_snapshot.is_null());
        assert_eq!(listed[0].status, "Draft");
    }

    #[test]
    fn draft_update_replaces_items_in_one_transaction() {
        let db = Database::in_memory().unwrap();
        let saved = db.save_draft(draft()).unwrap();
        let mut changed = draft();
        changed.id = Some(saved.id.clone());
        changed.items = vec![DraftItemInput {
            id: None,
            sort_order: 0,
            description: "Updated".into(),
            quantity: "2".into(),
            unit_snapshot: None,
            unit_price_ht: Some("10".into()),
        }];
        let updated = db.save_draft(changed).unwrap();
        assert_eq!(updated.id, saved.id);
        assert_eq!(updated.items.len(), 1);
        assert_eq!(updated.items[0].description, "Updated");
        assert_eq!(updated.total_ttc, "23.80");
    }

    #[test]
    fn calculations_reject_invalid_values_and_cover_long_documents() {
        let items = (0..100)
            .map(|index| DraftItemInput {
                id: None,
                sort_order: index,
                description: format!("Item {index}"),
                quantity: "1.25".into(),
                unit_snapshot: None,
                unit_price_ht: Some("10.10".into()),
            })
            .collect::<Vec<_>>();
        let totals = calculate_totals(&items, "19").unwrap();
        assert_eq!(totals.total_ht, "1263.00");
        assert_eq!(totals.vat_amount, "239.97");
        assert_eq!(totals.total_ttc, "1502.97");
        let mut invalid = items[0].clone();
        invalid.quantity = "0".into();
        assert!(calculate_totals(&[invalid], "19").is_err());
        let mut invalid = items[0].clone();
        invalid.description.clear();
        assert!(calculate_totals(&[invalid], "19").is_err());
    }

    #[test]
    fn transactions_roll_back_on_invalid_draft() {
        let db = Database::in_memory().unwrap();
        let mut invalid = draft();
        invalid.items[0].quantity = "not-a-number".into();
        assert!(db.save_draft(invalid).is_err());
        let connection = db.connection.lock().unwrap();
        let count: i64 = connection
            .query_row("SELECT COUNT(*) FROM documents", [], |row| row.get(0))
            .unwrap();
        assert_eq!(count, 0);
    }
}
