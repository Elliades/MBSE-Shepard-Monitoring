# MCPFeature sur la branche `0-DEV-CHAK`

Package : `omf-public-features/src/main/java/com/samares_engineering/omf/omf_public_features/mcp/`  
Classe principale : **`MCPFeature extends AFeature`**.

## Appliquer sur ton `OMF_Private` Windows (branche `0-DEV-CHAK`)

```powershell
cd C:\workspace\java\mdplugins\OMF\OMF_Private
git checkout 0-DEV-CHAK
git pull

# Option 1 — patch (recommandé)
git am ..\MBSE-Shepard-Monitoring\omf-mcp-feature-export\patches\0001-*.patch

# Option 2 — copie du dossier mcp
xcopy /E /I /Y ..\MBSE-Shepard-Monitoring\omf-mcp-feature-export\omf-public-features\src\main\java\com\samares_engineering\omf\omf_public_features\mcp `
  omf-public-features\src\main\java\com\samares_engineering\omf\omf_public_features\mcp\
```

Puis vérifier :

- `omf-public-features/build.gradle` contient `implementation 'org.json:json:20230227'`
- `OMFExamplePlugin.java` contient `import ...mcp.MCPFeature` et `new MCPFeature()`

Commit local :

```powershell
git add omf-public-features omf-example-plugin
git commit -m "feat(mcp): MCPFeature server and tools"
git push origin 0-DEV-CHAK
```

## Commit de référence

`329cc535` — feat(mcp): add MCPFeature server and model/simulation tools

---

# RelayFeature (connexion distante Shepard)

Package : `omf-public-features/.../relay/`  
Classe principale : **`RelayFeature extends AFeature`**.

MagicDraw ouvre une WebSocket **sortante** vers `wss://…/relay/md?session=CODE`, affiche le lien navigateur `https://…/?session=CODE`, et relaie les signaux de simulation (sans MCP).

## Intégration OMF

1. Copier le dossier `relay/` à côté de `mcp/` dans `omf-public-features`.
2. Ajouter dans `build.gradle` : `implementation 'org.java-websocket:Java-WebSocket:1.5.6'`
3. Mettre à jour `MCPSimulationBridge.java` (observers `addSignalObserver` / `removeSignalObserver`).
4. Enregistrer dans le plugin : `new RelayFeature()` (en plus ou à la place de MCP selon le besoin).

Options d’environnement :

- **Relay WebSocket URL** — défaut `wss://shepherd.chaos-art.fr/relay/md`
- **Front base URL** — défaut `https://shepherd.chaos-art.fr/`

Au démarrage, la console OMF affiche le code de session et l’URL à ouvrir dans le navigateur.
