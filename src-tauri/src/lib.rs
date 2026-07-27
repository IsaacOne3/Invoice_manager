pub mod db;

use serde_json::Value;
use tauri::Manager;

#[tauri::command]
fn list_companies(
    database: tauri::State<'_, db::Database>,
    active_only: bool,
) -> Result<Vec<db::Company>, String> {
    database
        .list_companies(active_only)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn create_company(
    database: tauri::State<'_, db::Database>,
    company: db::Company,
) -> Result<db::Company, String> {
    database
        .create_company(company)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn update_company(
    database: tauri::State<'_, db::Database>,
    company: db::Company,
) -> Result<(), String> {
    database
        .update_company(&company)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn list_document_types(
    database: tauri::State<'_, db::Database>,
    active_only: bool,
) -> Result<Vec<db::DocumentType>, String> {
    database
        .list_document_types(active_only)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn create_document_type(
    database: tauri::State<'_, db::Database>,
    definition: db::DocumentType,
) -> Result<db::DocumentType, String> {
    database
        .create_document_type(definition)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn update_document_type(
    database: tauri::State<'_, db::Database>,
    definition: db::DocumentType,
) -> Result<(), String> {
    database
        .update_document_type(&definition)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn list_units(
    database: tauri::State<'_, db::Database>,
    active_only: bool,
) -> Result<Vec<db::Unit>, String> {
    database
        .list_units(active_only)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn create_unit(
    database: tauri::State<'_, db::Database>,
    unit: db::Unit,
) -> Result<db::Unit, String> {
    database
        .create_unit(unit)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn update_unit(database: tauri::State<'_, db::Database>, unit: db::Unit) -> Result<(), String> {
    database
        .update_unit(&unit)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn list_clients(
    database: tauri::State<'_, db::Database>,
    active_only: bool,
) -> Result<Vec<db::Client>, String> {
    database
        .list_clients(active_only)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn create_client(
    database: tauri::State<'_, db::Database>,
    client: db::Client,
) -> Result<db::Client, String> {
    database
        .create_client(client)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn create_draft(
    database: tauri::State<'_, db::Database>,
    company_snapshot: Value,
    document_type_snapshot: Value,
) -> Result<db::CommercialDocument, String> {
    database
        .save_draft(db::DraftInput {
            id: None,
            internal_draft_reference: None,
            document_type_snapshot,
            company_snapshot,
            client_snapshot: Value::Null,
            official_number: None,
            issue_date: None,
            place: None,
            reference: None,
            note: None,
            vat_rate: "0".into(),
            source_asset_id: None,
            currency_code: "DZD".into(),
            items: Vec::new(),
        })
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn get_document(
    database: tauri::State<'_, db::Database>,
    id: String,
) -> Result<Option<db::CommercialDocument>, String> {
    database
        .get_document(&id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn list_documents(
    database: tauri::State<'_, db::Database>,
) -> Result<Vec<db::CommercialDocument>, String> {
    database.list_documents().map_err(|error| error.to_string())
}

#[tauri::command]
fn save_draft(
    database: tauri::State<'_, db::Database>,
    input: db::DraftInput,
) -> Result<db::CommercialDocument, String> {
    database
        .save_draft(input)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_pdf(app: tauri::AppHandle, filename: String, bytes: Vec<u8>) -> Result<String, String> {
    let safe_name = filename
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || matches!(character, '-' | '_' | '.') {
                character
            } else {
                '_'
            }
        })
        .collect::<String>();
    let output = app
        .path()
        .download_dir()
        .map_err(|error| error.to_string())?
        .join(if safe_name.ends_with(".pdf") {
            safe_name
        } else {
            format!("{safe_name}.pdf")
        });
    std::fs::write(&output, bytes).map_err(|error| error.to_string())?;
    Ok(output.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_companies,
            create_company,
            update_company,
            list_document_types,
            create_document_type,
            update_document_type,
            list_units,
            create_unit,
            update_unit,
            list_clients,
            create_client,
            create_draft,
            get_document,
            list_documents,
            save_draft,
            save_pdf
        ])
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let database = db::Database::open(data_dir.join("invoice-manager.sqlite3"))
                .map_err(|error| Box::<dyn std::error::Error>::from(error))?;
            app.manage(database);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
