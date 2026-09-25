# MCPFeature — export pour OMF

Implémentation officielle `MCPFeature extends AFeature` (package `com.samares_engineering.omf.omf_public_features.mcp`).

## Intégration dans [OMF](https://github.com/OMF-Open-MBSE-Framework/OMF)

1. Copier `omf-public-features/src/.../mcp/` vers le même chemin dans votre clone OMF.
2. Dans `omf-public-features/build.gradle`, ajouter : `implementation 'org.json:json:20230227'`
3. Dans `OMFExamplePlugin.initFeatures()`, ajouter `new MCPFeature()` (activée par défaut).
4. Compiler avec `:omf-example-plugin:runPlugin`.

Commit de référence local (non poussé sur upstream) : branche `cursor/mcp-feature-omf-97a5` dans le sous-module `OMF_Private`.

## Serveur

- URL : `http://127.0.0.1:9851` (port configurable via options d’environnement OMF)
- Protocole : JSON-RPC 2.0 (`initialize`, `tools/list`, `tools/call`)
- Découverte : `GET /` renvoie la liste des outils

## Outils

`get_project`, `get_element`, `find_elements`, `factory_create`, `connect`, `display`, `modify_layout`, `autolayout`, `undo`, `redo`, `run_simulation`, `simulation_info`

Les mutations passent par `OMFBarrierExecutor.executeInSessionWithinBarrier`. Sans CST, `run_simulation` / `simulation_info` renvoient `SIMULATION_UNAVAILABLE`.
