/** Reusable Cameo gestures (shown on demand instead of repeating in every step). */
export const GESTURES = {
  specification: {
    id: 'specification',
    title: 'Ouvrir la Specification',
    steps: [
      'Sélectionne l’élément dans le diagramme ou l’arbre.',
      'Clic droit → Specification, ou Entrée.',
      'Si un autre diagramme s’ouvre, reste sur la sélection et appuie sur Entrée.',
    ],
  },
  expert: {
    id: 'expert',
    title: 'Mode Expert (Specification)',
    steps: [
      'Dans la boîte Specification, champ Properties en haut à droite.',
      'Choisis Expert pour voir plus de propriétés.',
    ],
  },
  createDiagram: {
    id: 'createDiagram',
    title: 'Créer un diagramme SysML',
    steps: [
      'Clic droit sur l’élément → Create Diagram.',
      'Section SysML Diagrams : choisis le type (ex. Sequence Diagram).',
      'Si la liste est vide, clique Expert sous la liste des types.',
    ],
  },
  dragFromBrowser: {
    id: 'dragFromBrowser',
    title: 'Glisser depuis l’arbre',
    steps: [
      'Déploie le package dans le Model Browser (clic sur +).',
      'Glisse l’élément sur le diagramme ou la lifeline.',
    ],
  },
  sequenceMessage: {
    id: 'sequenceMessage',
    title: 'Message sur diagramme de séquence',
    steps: [
      'Palette : Message ou Message to Self, ou clic sur la lifeline.',
      'Arrête le tracé quand la ligne bleue verticale apparaît sur la lifeline cible.',
    ],
  },
  transition: {
    id: 'transition',
    title: 'Créer une transition',
    steps: [
      'Sélectionne l’état source.',
      'Bouton Transition sur la smart manipulator → clic sur l’état cible.',
    ],
  },
  dragSignal: {
    id: 'dragSignal',
    title: 'Allouer un signal sur une transition',
    steps: [
      'Déploie 2 – Functional Analysis → B Functional Data → Deployment.',
      'Glisse le signal sur la transition entre les deux états.',
    ],
  },
  doActivity: {
    id: 'doActivity',
    title: 'Do Activity sur un état',
    steps: [
      'Dans l’arbre : 2 – Functional Analysis → A Functional architecture → Deployment.',
      'Glisse l’activité sur l’état → choisis Do Activity.',
    ],
  },
  simulation: {
    id: 'simulation',
    title: 'Lancer la simulation STM',
    steps: [
      'Ouvre le diagramme de machine à états du SOI.',
      'Simulate → icône Simulation en haut à droite → Run.',
      'Panneau Simulation en bas : Play (flèche verte), puis Trigger pour les signaux.',
    ],
  },
  crossSim: {
    id: 'crossSim',
    title: 'Simulation croisée STM + activité',
    steps: [
      'Ouvre STM et Activity Diagram dans deux onglets.',
      'Double-clic sur le libellé Do Load flight plan pour ouvrir l’AD.',
      'Relance la simulation : à l’état Configured, un jeton rouge apparaît dans l’AD.',
    ],
  },
}
