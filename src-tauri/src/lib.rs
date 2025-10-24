use log::{debug, error, info, warn};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("qube".to_string()),
                    }),
                ])
                .level(if cfg!(debug_assertions) {
                    log::LevelFilter::Debug
                } else {
                    log::LevelFilter::Info
                })
                .build(),
        )
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init());

    info!("Initializing Tauri application builder");
    debug!("Loading core plugins: fs, dialog, log, process, updater, os");

    #[cfg(desktop)]
    {
        debug!("Loading desktop-specific plugins: single-instance");
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
                info!("New app instance detected with arguments: {:?}", argv);
                warn!("Deep link event was already triggered for this instance");
            }))
            .plugin(tauri_plugin_updater::Builder::new().build());
    }

    debug!("Loading additional plugins: deep-link, http, opener");
    builder = builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init());

    info!("Configuring invoke handlers");
    builder = builder.invoke_handler(tauri::generate_handler![]);

    info!("Starting Tauri application runtime");
    match builder.run(tauri::generate_context!()) {
        Ok(_) => {
            info!("Tauri application started successfully");
        }
        Err(e) => {
            error!("Failed to start Tauri application: {}", e);
            panic!("Critical error while running tauri application: {}", e);
        }
    }
}
