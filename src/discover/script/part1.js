/**
 * BE Cameo Part 1 — Discover.
 * Une scène = une action complète (trouver + créer + remplir), pas une phrase.
 * @typedef {{ title: string, body: string }} Task
 * @typedef {{ id: string, title: string, body?: string, tasks?: Task[], gestures?: string[], tips?: string[], figure?: string, faq?: string[], copy?: { label: string, value: string }[], quiz?: object }} Step
 * @typedef {{ id: string, title: string, steps: Step[] }} Section
 */

/** @type {Section[]} */
export const PART1_SECTIONS = [
  {
    id: 'prep',
    title: 'Préparation',
    steps: [
      {
        id: 'prep-start',
        title: 'Démarrer Cameo et le modèle',
        body: 'Licence, perspective, puis le projet étudiant. Les réflexes arbre / diagramme sont la scène suivante.',
        copy: [
          { label: 'Serveur', value: 'licence-w2k19.isae.fr' },
          { label: 'Port', value: '1101' },
        ],
        tasks: [
          {
            title: 'Licence flottante',
            body: 'Lance Catia Magic Systems of Systems Architect. Defaults, puis Use a floating license. Serveur et port ci-dessus.',
          },
          {
            title: 'Perspective',
            body: 'Systems Engineer, profil SYSML, coche Expert. Plus tard : Options → Perspectives → System Engineer (courant) + Expert.',
          },
          {
            title: 'Ouvrir le modèle',
            body: 'Les deux .mdzip dans un dossier, sans les dézipper. Open the project → UAV_BE_Note_2024_V2_Exercice Student.mdzip. SAMAREQ_Profile se charge tout seul.',
          },
        ],
      },
    ],
  },
  {
    id: 'landmarks',
    title: 'Repères',
    steps: [
      {
        id: 'landmarks-tree-view',
        title: 'Arbre = modèle, diagramme = vue',
        body: 'L’arbre Containment est la source de vérité : chaque élément du modèle y vit une fois. Un diagramme n’est qu’une vue. Le même élément peut être dessiné sur plusieurs diagrammes, ou sur aucun.',
        figures: [
          { src: 'tree-containment.png', caption: 'Arbre — le modèle' },
          { src: 'diagram-view.png', caption: 'Diagramme — une vue' },
        ],
        tasks: [
          {
            title: 'Retrouver l’élément dans l’arbre',
            body: 'Depuis une forme du diagramme : clic droit → Select in Containment Tree, ou Alt+B. La sélection passe dans l’arbre, sur l’élément du modèle.',
          },
          {
            title: 'Supprimer pour de vrai',
            body: 'Suppr enlève la forme de la vue. L’élément reste dans l’arbre et sur les autres diagrammes. Ctrl+D le supprime du modèle, donc de toutes les vues.',
          },
          {
            title: 'Ouvrir la Specification',
            body: 'Clic droit → Specification, ou Entrée. Si un autre diagramme s’ouvre à la place, reviens à la sélection et appuie sur Entrée.',
          },
        ],
        gestures: ['expert'],
      },
    ],
  },
  {
    id: 'discover',
    title: 'Découvrir le SOI',
    steps: [
      {
        id: 'discover-soi',
        title: 'Lire le système dans le modèle',
        body: 'Il n’y a pas de texte de cours sur le drone. Le modèle est la source : contexte, puis les trois niveaux, puis la mission que tu dois pouvoir raconter.',
        tasks: [
          {
            title: 'Contexte opérationnel',
            body: 'Ouvre {ref:opContext} (IBD). Les Item Flows relient le drone à la station et au GNSS. L’opérateur ne fait que démarrer et arrêter : le SOI est autonome.',
          },
          {
            title: 'Intérieur du drone',
            body: 'Double-clic sur l’icône UAV pour son IBD interne. Flèche en haut à gauche pour revenir au contexte.',
          },
          {
            title: 'Trois niveaux',
            body: 'Parcours Operational, Functional et Physical. Note ce qui est un acteur, une fonction, un sous-système.',
          },
          {
            title: 'La mission',
            body: 'Selon le plan de vol : rejoindre la zone sûre, patrouiller le périmètre, surveiller l’ours, notifier le berger s’il entre dans la zone.',
          },
        ],
        tips: ['SD = Sunny Day (nominal). RD = Rainy Day (quelque chose échoue).'],
      },
    ],
  },
  {
    id: 'seq-a',
    title: '4.A — Séquence',
    steps: [
      {
        id: 'seq-sd1',
        title: 'Créer [SD1] Loading Flight Plan success',
        body: 'Idée du scénario : l’opérateur démarre le SOI via la station, envoie le plan de vol en WiFi, le drone le charge et vérifie le périmètre. Si c’est bon, la station est notifiée et l’opérateur sait que la mission peut démarrer.',
        tasks: [
          {
            title: 'Trouver le cas d’utilisation',
            body: 'Ouvre {ref:ucScenarios}, déploie {ref:prepPhasePkg}. Repère Parameter Mission (à côté de Surveillance of a safe zone et Protect the sheeps from predators). C’est celui-là.',
          },
          {
            title: 'Type de scénario et nom',
            body: 'C’est un Sunny Day : tout se passe bien. SD = nominal, RD = dysfonctionnel. Crée un SysML Sequence Diagram sur Parameter Mission et nomme-le [SD1] Loading Flight Plan success.',
          },
          {
            title: 'Lifelines',
            body: 'Glisse {ref:actorMissionOperator} et {ref:actorGroundStation} depuis les acteurs. Le drone manque : ajoute {ref:soiPastureSentinel} depuis l’architecture physique.',
          },
          {
            title: 'Messages',
            body: 'Uniquement Message et Message to Self. Vers soi : Load FlightPlan, puis Check FlightPlan Perimeter. Entre acteurs : signaux physiques depuis {ref:funcDataDeploy}. Arrête la flèche quand la ligne bleue verticale apparaît.',
          },
        ],
        gestures: ['createDiagram', 'dragFromBrowser', 'sequenceMessage'],
        faq: ['functional-vs-physical'],
        figure: 'sd1-expected.png',
        quiz: {
          id: 'q1',
          mode: 'single',
          prompt: 'Quel est le type de ce diagramme de séquence ?',
          options: [
            { id: 'black', label: 'Black-Box' },
            { id: 'white', label: 'White-Box' },
          ],
          correct: ['white'],
          explanation:
            'White-Box : le SOI est une lifeline et reçoit des Message to Self (Load FlightPlan, Check FlightPlan Perimeter). On voit un comportement interne, pas seulement les échanges avec l’extérieur.',
        },
      },
    ],
  },
  {
    id: 'func-b',
    title: '4.B — Fonctions',
    steps: [
      {
        id: 'func-create',
        title: 'Créer les fonctions de Parameter Mission',
        body: 'Le SD ne montre qu’un scénario. Les messages que le SOI traite deviennent des fonctions (Activity), rangées par service dans l’architecture fonctionnelle.',
        quizFirst: true,
        quiz: {
          id: 'q2',
          mode: 'multiple',
          prompt: 'Depuis [SD1], quelles sont les 4 nouvelles fonctions du SOI ?',
          options: [
            { id: 'receive', label: 'Receive Flight Plan' },
            { id: 'load', label: 'Load Flight Plan' },
            { id: 'check', label: 'Check Flight Plan Perimeter' },
            { id: 'notify', label: 'Notify Mission Ready' },
            { id: 'patrol', label: 'Start Patrolling' },
            { id: 'guard', label: 'Guard the Sheep' },
            { id: 'wifi', label: 'Encode WiFi Frame' },
          ],
          correct: ['receive', 'load', 'check', 'notify'],
          explanation:
            'Réception du plan, chargement, vérification du périmètre, notification que la mission est prête. Patrouille et garde sont d’autres phases. L’encodage WiFi est un moyen physique, pas une fonction du scénario.',
        },
        tasks: [
          {
            title: 'Ouvrir le bon package',
            body: 'Ouvre {ref:funcDeployPkg}. Les fonctions y sont des Activity, groupées par service (garde, configuration, suivi de mission…).',
          },
          {
            title: 'Package et activité racine',
            body: 'Clic droit sur Deployment → create element → Activity, nom Parameter Mission. Crée un package Parameter Mission et déplace l’activité dedans.',
          },
          {
            title: 'Les 4 activités',
            body: 'Dans ce package, crée les 4 Activity de la question (noms alignés avec les messages du SD).',
          },
        ],
      },
    ],
  },
  {
    id: 'stm-c',
    title: '4.C — Machine à états',
    steps: [
      {
        id: 'stm-complete',
        title: 'Brancher Load Flight Plan sur la STM',
        body: 'La machine existe déjà sous le SOI. Tu ajoutes l’état Configured, tu poses les signaux sur les transitions, puis tu attaches la fonction en Do Activity.',
        tasks: [
          {
            title: 'Ouvrir la machine',
            body: 'Depuis {ref:soiPastureSentinel}, ouvre {ref:stmSoi}.',
          },
          {
            title: 'État Configured',
            body: 'Dans Undeployed, palette State, à côté de Unconfigured. Nomme-le Configured.',
          },
          {
            title: 'Trois transitions',
            body: 'Unconfigured → Configured : {ref:signalFlightPlan}. Configured → Unconfigured : {ref:signalFlightPlanCheckFailed}. Configured → Ready for Mission : {ref:signalReadyForMission}.',
          },
          {
            title: 'Do Activity',
            body: 'Glisse {ref:activityLoadFlightPlan} sur Configured et choisis Do Activity. La fonction tourne tant que l’état est actif.',
          },
        ],
        gestures: ['transition', 'dragSignal', 'doActivity'],
        figure: 'stm-expected.png',
      },
      {
        id: 'stm-sim',
        title: 'Simuler la machine et l’activité',
        body: 'Deux lectures du même run : la machine change d’état, et l’activité se déroule quand on entre dans Configured.',
        tasks: [
          {
            title: 'Lancer la STM',
            body: 'Diagramme du SOI ouvert. Simulate → Run, puis Play dans le panneau du bas. Avance avec la liste Trigger. Le curseur Animation Speed règle la vitesse.',
          },
          {
            title: 'Croiser avec l’activité',
            body: 'Double-clic sur le libellé Do Load flight plan pour ouvrir l’AD. Garde STM et AD dans deux onglets. À l’entrée dans Configured, un jeton rouge apparaît dans l’AD.',
          },
          {
            title: 'Voir les deux ensemble',
            body: 'Tu peux glisser l’AD sur la STM, sélectionner le diagramme et cliquer l’œil pour afficher son contenu pendant le run.',
          },
        ],
        gestures: ['simulation', 'crossSim'],
        figure: 'sim-panel.png',
      },
    ],
  },
  {
    id: 'ad-d',
    title: '4.D — Activité',
    steps: [
      {
        id: 'ad-load',
        title: 'Spécifier Load Flight Plan',
        body: 'Un SD ne raconte qu’un cas. L’activité doit couvrir le succès et l’échec : plan accepté → Ready for mission et notification opérateur ; plan hors périmètre → FlightPlan Check Failed.',
        tasks: [
          {
            title: 'Créer le diagramme',
            body: 'Clic droit sur {ref:activityLoadFlightPlan} → Create Diagram → Activity Diagram. Si une fenêtre propose d’afficher les paramètres, Ok.',
          },
          {
            title: 'Poser les fonctions',
            body: 'Glisse les activités liées depuis le package Parameter Mission. Les données viennent de {ref:funcDataDeploy} (plan reçu par WiFi).',
          },
          {
            title: 'Décision et signaux',
            body: 'Decision node pour le contrôle de périmètre. Gardes entre crochets, par exemple [else]. Send Signal : {ref:signalReadyForMission} si OK, {ref:signalFlightPlanCheckFailed} pour le Rainy Day [RD 1] Flight plan out of range.',
          },
          {
            title: 'Parallélisme',
            body: 'Fork node si la notification opérateur part en même temps que le signal Ready for mission.',
          },
          {
            title: 'Vérifier',
            body: 'Simule l’AD : le jeton doit couvrir toutes les branches. Puis relance la STM : entrer dans Configured déclenche l’AD, et un plan OK mène seul à Ready for Mission.',
          },
        ],
        gestures: ['createDiagram', 'simulation', 'crossSim'],
        faq: ['functional-vs-physical', 'sd-vs-ad'],
        figure: 'ad-decision.png',
        tips: ['Couvrir tout le diagramme à la main devient vite pénible : c’est pour ça qu’on parle de vérification automatique et de réseaux de Petri.'],
      },
    ],
  },
  {
    id: 'alloc-e',
    title: '4.E — Allocation',
    steps: [
      {
        id: 'alloc-matrix',
        title: 'Allouer les fonctions aux sous-systèmes',
        body: 'Même SOI, deux vues. L’allocation dit quelle fonction vit sur quel sous-système, pour savoir ce qui bouge quand on modifie le modèle.',
        tasks: [
          {
            title: 'Deux vues',
            body: 'Sous {ref:soiPastureSentinel} : {ref:uavData} (données, cyber) et {ref:uavEnergy} (énergie, physique).',
          },
          {
            title: 'Matrice',
            body: 'Complète {ref:traceabilityAlloc}. Deux fonctions vont au système de navigation, une au WiFi.',
          },
        ],
        tips: ['L’allocation prépare l’analyse d’impact : qui est touché quand on crée, lit, modifie ou supprime un élément.'],
      },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    steps: [
      {
        id: 'faq-all',
        title: 'Quatre pièges du sujet',
        tasks: [
          {
            title: 'Messages du SD et noms de fonctions',
            body: 'Pas de lien automatique. C’est à toi de garder les mêmes noms entre le message et l’activité.',
          },
          {
            title: 'FlightPlan et Wifi_FlightPlan',
            body: 'FlightPlan est le concept (une liste de positions, sans format). Wifi_FlightPlan est la solution (trame, cadence, moyen). Le fonctionnel dit le but, le physique dit comment.',
          },
          {
            title: 'Point d’arrêt',
            body: 'Clic droit sur l’action dans le diagramme → Simulation → Add Breakpoint.',
          },
          {
            title: 'Le contexte est-il un diagramme SysML ?',
            body: 'Oui : un IBD utilisé comme contexte opérationnel. La notation reste SysML, on ne crée pas un nouveau type de diagramme.',
          },
        ],
        faq: ['functional-vs-physical'],
      },
    ],
  },
]

/** @type {Record<string, string>} */
export const FAQ_SNIPPETS = {
  'functional-vs-physical':
    'Flux fonctionnel = objectif métier (ex. plan de vol). Flux physique = solution d’implémentation (WiFi, tension, cadence…).',
  'sd-vs-ad':
    'Un SD = un scénario (SD ou RD). Un AD regroupe tous les scénarios possibles (nominal + échec).',
}

export const ALL_STEP_IDS = PART1_SECTIONS.flatMap((s) => s.steps.map((st) => st.id))
