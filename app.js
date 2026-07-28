(() => {
  'use strict';

  const SAVE_KEY = 'wayfarersChronicle.longform.v1';
  const $ = (id) => document.getElementById(id);
  const el = {
    locationName: $('locationName'), characterName: $('characterName'), characterClass: $('characterClass'), portraitInitial: $('portraitInitial'),
    hpText: $('hpText'), hpBar: $('hpBar'), xpText: $('xpText'), xpBar: $('xpBar'), goldText: $('goldText'), acText: $('acText'),
    timeText: $('timeText'), weatherText: $('weatherText'), objectiveText: $('objectiveText'), actLabel: $('actLabel'), sceneLabel: $('sceneLabel'),
    placeTitle: $('placeTitle'), placeSummary: $('placeSummary'), recentList: $('recentList'), contactsList: $('contactsList'),
    speakerBlock: $('speakerBlock'), speakerAvatar: $('speakerAvatar'), speakerName: $('speakerName'), speakerRole: $('speakerRole'),
    storyCard: $('storyCard'), storyContent: $('storyContent'), resultLedger: $('resultLedger'), actions: $('actions'),
    panelDialog: $('panelDialog'), dialogEyebrow: $('dialogEyebrow'), dialogTitle: $('dialogTitle'), dialogBody: $('dialogBody'),
    diceOverlay: $('diceOverlay'), dicePurpose: $('dicePurpose'), die: $('die'), dieValue: $('dieValue'), diceMath: $('diceMath'), toast: $('toast')
  };

  const initialState = () => ({
    node: 'opening1', hp: 12, maxHp: 12, xp: 0, gold: 14, ac: 12, time: 'Dawn', weather: 'Cold rain',
    character: { name: 'Wayfarer', className: 'Human Wanderer', level: 1 },
    objective: 'Reach Veycross before the western gate closes.',
    inventory: [{name:'Weathered travel cloak', qty:1},{name:'Iron shortsword',qty:1},{name:'Dried provisions',qty:2}],
    journal: [
      {title:'The Grey March', text:'You descended from the northern highlands toward Veycross, carrying a sealed letter addressed to Archivist Elian Voss.'}
    ],
    codex: [
      {title:'The River Vey', text:'A broad, slate-coloured river dividing the western marches from the fertile central provinces. Veycross controls its oldest surviving stone bridge.'}
    ],
    learned: ['The city of Veycross controls the only safe crossing of the River Vey.'],
    contacts: [], flags: {}, combat: null
  });

  let state = load() || initialState();

  const nodes = {
    opening1: {
      act:'Prologue', scene:'The Grey March', location:'The Grey March', place:'The Grey March',
      placeSummary:'A rain-darkened highland road descending toward the river city of Veycross.', objective:'Reach Veycross before the western gate closes.',
      text:[
        `For nearly three centuries, the western edge of the kingdom of Avarra has been defined by the River Vey: a broad, slate-coloured current fed by mountain snow, autumn rain, and a hundred lesser streams. East of the river lie orchards, old estates, and roads kept in reasonable repair by the Crown. West of it, the land rises into wind-carved hills where abandoned watchtowers stand above fields of heather and dark pine.`,
        `The people who live in those hills call the region the Grey March. It is a place of shepherds, charcoal burners, old border families, and villages built from the same black stone that pushes through the soil. They are practical people, slow to trust strangers and slower still to abandon a grudge.`,
        `At the centre of the March stands Veycross, the only city for fifty miles in any direction and the keeper of the oldest bridge across the river.`
      ], next:'opening2'
    },
    opening2: {
      act:'Prologue', scene:'The Road Below', location:'Northern Approach', place:'Northern Approach',
      placeSummary:'The final ridge overlooking Veycross and the flooded lowlands surrounding it.',
      text:[
        `By dawn, the road has become a ribbon of mud descending through the hills. Cold rain whispers against your cloak and gathers along the brim of your hood before falling in slow, heavy drops. Each step presses water from the ground.`,
        `Then the road bends around a granite outcrop, and Veycross finally appears below.`,
        `The city occupies both banks of the River Vey. On the western side, steep streets climb toward a weathered citadel whose square towers are black with rain. Across the water, newer districts spread through the floodplain: tile-roofed workshops, warehouses, gardens enclosed by stone walls, and crowded rows of timber houses. Between them stretches the great bridge—seven pale arches crossing the dark river beneath iron lamps still burning in the morning gloom.`,
        `Even from the ridge, you can see that something is wrong. A line of carts has stopped outside the western gate, and mounted guards are searching every wagon before allowing it through.`
      ], next:'opening3'
    },
    opening3: {
      act:'Prologue', scene:'The Letter', location:'Northern Approach', place:'Northern Approach',
      placeSummary:'The final ridge overlooking Veycross and the flooded lowlands surrounding it.',
      text:[
        `Inside your coat, protected by waxed cloth, is the reason you have come: a sealed letter from Brother Aldren of Saint Orra's Monastery. The old monk gave you no explanation beyond the name written on its face—Archivist Elian Voss—and a warning not to surrender it to anyone else.`,
        `“Veycross remembers things the rest of the kingdom has chosen to forget,” he told you. “Find Voss. Let him decide whether remembering will save us.”`,
        `The words have followed you for four days. Now, as thunder rolls over the hills behind you, the western gate begins to close halfway. A bell rings once from the city wall.`
      ], choices:[
        {label:'Join the wagon line', detail:'Approach openly and enter through the guarded western gate.', target:'gate1', tone:'safe'},
        {label:'Leave the road and approach the riverside', detail:'Look for another route while the guards focus on the gate.', target:'riverApproach', tone:'risky'},
        {label:'Observe the searches before committing', detail:'Take a few minutes to understand what the guards are looking for.', check:{ability:'Insight',mod:2,dc:11,success:'observeSuccess',failure:'observeFailure'}, tone:'social'}
      ]
    },
    observeSuccess: {
      act:'Prologue',scene:'A Pattern in the Search',location:'Northern Approach',place:'Northern Approach',
      text:[
        `You shelter beneath the outcrop and watch three wagons pass through inspection. The guards do not care about contraband, travel papers, or unpaid tolls. They examine the drivers' hands, look beneath every seat, and compare the faces of lone travellers against a charcoal sketch held by their sergeant.`,
        `When a caged raven begins shrieking at the sight of a guard's blue cloak, two soldiers immediately cover the cage with canvas. Their unease is not directed at the travellers. It is directed at something they believe may be travelling among them.`,
        `You cannot see the entire sketch, but you catch one detail: the person they seek has a pale scar crossing the left eyebrow.`
      ], result:{title:'Observation Result',roll:true,changes:['You learned what the gate search is targeting.','New clue: a fugitive with a scar through the left eyebrow.','No time or health was lost.']}, onEnter:s=>{learn(s,'The city guard is searching for a lone traveller with a scar through the left eyebrow.'); s.flags.knowsGateSearch=true;},
      choices:[
        {label:'Join the wagon line',detail:'Enter openly, now knowing what the guards are looking for.',target:'gate1',tone:'safe'},
        {label:'Approach the riverside',detail:'Avoid the inspection and search for another entrance.',target:'riverApproach',tone:'risky'}
      ]
    },
    observeFailure: {
      act:'Prologue',scene:'Too Long in the Rain',location:'Northern Approach',place:'Northern Approach',
      text:[
        `You wait for a clear view, but rain thickens into a grey curtain. By the time the next wagon reaches the gate, water has found the seam beneath your collar and soaked the shirt across your shoulders. Your fingers stiffen around the edge of the rock.`,
        `You learn only that the guards are searching each vehicle far more carefully than routine entry would require. When the gate bell rings a second time, you realize you have traded warmth and daylight for very little certainty.`
      ], result:{title:'Observation Result',roll:true,hpLoss:1,cause:'Prolonged exposure to the freezing rain leaves you shivering and physically drained.',changes:['Health reduced by 1 from cold exposure.','You learned the search is unusual, but not what caused it.','Time advanced from Dawn to Early morning.']},
      onEnter:s=>{s.hp=Math.max(1,s.hp-1);s.time='Early morning';learn(s,'The western gate is conducting an unusually thorough search of every traveller.');},
      choices:[{label:'Join the wagon line',detail:'Stop waiting and enter openly.',target:'gate1',tone:'safe'},{label:'Approach the riverside',detail:'Look for a route away from the inspection.',target:'riverApproach',tone:'risky'}]
    },
    gate1: {
      act:'Act I',scene:'The Western Gate',location:'Veycross — Western Gate',place:'The Western Gate',
      placeSummary:'A fortified gatehouse of black stone, crowded by wet travellers and blue-cloaked city guards.',
      text:[
        `The line advances slowly beneath the shadow of the gatehouse. Rainwater pours from carved stone gargoyles and splashes into channels cut along the road. Merchants mutter over delays while horses stamp and toss their heads.`,
        `At the archway, a guard raises one gloved hand. She is a lean woman in her early forties, with close-cropped black hair, a narrow face, and a small notch missing from the upper rim of her right ear. Her dark-blue cloak is pinned with the silver bridge emblem of the Veycross Watch. Nothing about her expression is openly hostile, but her eyes move with disciplined care from your boots to your hands and finally to your face.`,
        `“Name, business, and intended lodging,” she says. Her voice is low enough that you must lean closer to hear it over the rain.`
      ], speaker:{name:'Sergeant Mara Vale',role:'Veycross Watch',avatar:'M'}, onEnter:s=>addContact(s,'Sergeant Mara Vale','A disciplined city guard with close-cropped black hair and a notched right ear.'), next:'gate2'
    },
    gate2: {
      act:'Act I',scene:'The Western Gate',location:'Veycross — Western Gate',place:'The Western Gate',speaker:{name:'Sergeant Mara Vale',role:'Veycross Watch',avatar:'M'},
      text:[
        `You give your name and explain that you have come to deliver correspondence to the city archive. Vale's gaze briefly drops toward the inside of your coat, though the letter remains hidden.`,
        `“Archive is in the Lantern District, east side of the bridge,” she replies. “But Archivist Voss hasn't reported for duty in three days.”`,
        `For the first time, a trace of strain enters her expression. Behind her, another guard quietly turns away a farmer whose cart contains nothing more suspicious than wet sacks of turnips.`
      ], choices:[
        {label:'Ask what happened to Voss',detail:'Press for information without revealing the letter.',target:'gateAskVoss',tone:'social'},
        {label:'Reveal Brother Aldren’s sealed letter',detail:'Show that your business may be connected to Voss’s disappearance.',target:'gateReveal',tone:'risky'},
        {label:'Thank her and enter the city',detail:'Keep the letter private and seek answers elsewhere.',target:'city1',tone:'safe'}
      ]
    },
    gateAskVoss:{
      act:'Act I',scene:'A Missing Archivist',location:'Veycross — Western Gate',place:'The Western Gate',speaker:{name:'Sergeant Mara Vale',role:'Veycross Watch',avatar:'M'},
      text:[
        `Vale studies you for a long moment before looking toward the line behind you.`,
        `“He left the archive after sunset three nights ago. Never reached home. His rooms were undisturbed, and no body has been recovered from the river.” She lowers her voice. “That is all the Watch has made public.”`,
        `The phrasing is deliberate. There is more, but not enough trust between you for her to share it at the gate.`
      ], result:{title:'Conversation Result',changes:['You learned that Elian Voss disappeared three nights ago.','Vale hinted that the Watch is withholding evidence.','New objective: locate Voss or determine what happened to him.']},onEnter:s=>{s.objective='Find Archivist Elian Voss and deliver Brother Aldren’s letter.';learn(s,'Archivist Elian Voss vanished after leaving work three nights ago.');},next:'city1'
    },
    gateReveal:{
      act:'Act I',scene:'The Seal of Saint Orra',location:'Veycross — Western Gate',place:'The Western Gate',speaker:{name:'Sergeant Mara Vale',role:'Veycross Watch',avatar:'M'},
      text:[
        `You draw the waxed wrapping far enough for Vale to see the monastery seal. The change in her is immediate but controlled: her shoulders stiffen, and her eyes return to your face.`,
        `“Put that away.” She steps closer, blocking the letter from the view of the other guards. “Do not show it again in the street.”`,
        `She tells you to find an inn called the Crooked Lantern and ask its proprietor, Tomas Rook, for the room overlooking Bellmaker's Lane. If Voss left preparations for anyone, Rook may know where to begin.`,
        `Before waving you through, Vale adds, “Someone searched the archive the night after he vanished. They knew exactly which cabinet to open.”`
      ],result:{title:'Trust Earned',changes:['Vale recognized the seal and chose to help you.','New contact: Tomas Rook at the Crooked Lantern.','New clue: the archive was searched after Voss disappeared.','Vale warned you to conceal the letter.']},onEnter:s=>{s.flags.valeTrust=true;s.objective='Find Tomas Rook at the Crooked Lantern.';learn(s,'Someone searched a specific cabinet in the archive after Voss disappeared.');learn(s,'Tomas Rook owns the Crooked Lantern and may have information prepared by Voss.');},next:'city1'
    },
    riverApproach:{
      act:'Prologue',scene:'Below the Wall',location:'Veycross — Riverbank',place:'The Western Riverbank',
      placeSummary:'A steep, reed-choked bank beneath the western wall, slick with mud and runoff.',
      text:[
        `You leave the road and descend through waist-high heather until the ground steepens toward the river. The city wall continues down to the water, but an old drainage culvert opens beneath it—a low arch half concealed by reeds and flood debris.`,
        `The current near the opening is fast. A line of flat stones offers a possible crossing to the culvert, though several are submerged. Farther upstream, you notice a narrow footpath used by fishermen. It bends toward a small postern door in the wall.`
      ],choices:[
        {label:'Cross the stones to the culvert',detail:'A direct but dangerous route beneath the wall.',check:{ability:'Athletics',mod:1,dc:12,success:'culvertSuccess',failure:'culvertFailure'},tone:'risky'},
        {label:'Follow the fishermen’s path',detail:'Look for a safer entrance and risk meeting whoever uses it.',target:'postern',tone:'safe'},
        {label:'Return to the western gate',detail:'Abandon the detour and enter openly.',target:'gate1',tone:'safe'}
      ]
    },
    culvertSuccess:{act:'Act I',scene:'The Flood Culvert',location:'Veycross — Old Culvert',place:'Old Flood Culvert',text:[
      `You time each step with the rhythm of the current. The final stone shifts beneath your boot, but you throw your weight forward and catch the lip of the culvert before the river can take you.`,
      `Inside, the tunnel smells of wet stone, rust, and something sharply medicinal. Fresh boot marks disturb the silt. One print bears a narrow split across the heel, repeated all the way into the city.`,
      `The culvert opens behind a shuttered dye workshop in the western district. You enter unseen—and with evidence that someone else has recently used the same hidden route.`],result:{title:'Crossing Result',roll:true,changes:['You entered Veycross without passing the gate.','New clue: fresh boot prints with a split heel used the culvert.','No health was lost.']},onEnter:s=>{learn(s,'Someone wearing a boot with a split heel recently entered Veycross through the old flood culvert.');s.flags.secretEntry=true;},next:'city1'},
    culvertFailure:{act:'Act I',scene:'Taken by the Current',location:'Veycross — Old Culvert',place:'Old Flood Culvert',text:[
      `The second submerged stone rolls beneath your weight. Your leg drops into the river, and the current twists you hard against the culvert wall. Your forearm strikes stone before you manage to drag yourself into the tunnel.`,
      `The impact leaves your arm throbbing and your sleeve torn, but the fall also places your hand beside a clear impression in the silt: a boot print marked by a narrow split through the heel. More prints lead toward the city.`,
      `You reach the interior of the wall soaked, bruised, and carrying a clue you would not have seen from above.`],result:{title:'Crossing Result',roll:true,hpLoss:2,cause:'The river sweeps your leg from beneath you and drives your forearm against the stone culvert wall.',changes:['Health reduced by 2 from the impact.','You still entered Veycross through the culvert.','New clue: a boot with a split heel used this route recently.']},onEnter:s=>{s.hp=Math.max(1,s.hp-2);learn(s,'Someone wearing a boot with a split heel recently entered Veycross through the old flood culvert.');s.flags.secretEntry=true;},next:'city1'},
    postern:{act:'Act I',scene:'The Fishermen’s Door',location:'Veycross — Postern Gate',place:'Fishermen’s Postern',text:[
      `The path ends at a narrow iron-bound door set into the wall. An elderly fisherman sits beneath a patched oilskin awning beside it. He has a long, weather-browned face, a white moustache stained yellow at one corner by pipe smoke, and hands swollen at the knuckles from decades of cold water.`,
      `He watches you approach without surprise. “Gate's for merchants,” he says. “This one's for fish, fools, and people with two silver pieces.”`
    ],speaker:{name:'Old Bren',role:'River fisherman',avatar:'B'},onEnter:s=>addContact(s,'Old Bren','An elderly, weather-browned fisherman with a smoke-stained white moustache.'),choices:[
      {label:'Pay 2 gold',detail:'Use the postern without attracting attention.',target:'posternPaid',cost:2,tone:'safe'},
      {label:'Ask what he has seen lately',detail:'Trade conversation before deciding whether to enter.',target:'brenTalk',tone:'social'},
      {label:'Return to the western gate',detail:'Keep your money and enter openly.',target:'gate1',tone:'safe'}
    ]},
    brenTalk:{act:'Act I',scene:'River Talk',location:'Veycross — Postern Gate',place:'Fishermen’s Postern',speaker:{name:'Old Bren',role:'River fisherman',avatar:'B'},text:[
      `Bren taps ash from his pipe and glances toward the culvert downstream.`,
      `“Three nights back, a man came out after midnight. Fine coat, no hat, blood on one cuff. Couldn't see his face. Walked like his left boot was coming apart.”`,
      `He remembers a second figure waiting among the reeds, but the two did not leave together. The waiting figure crossed the river in a narrow black skiff while the injured man climbed toward the city.`
    ],result:{title:'Information Gained',changes:['New clue: an injured man emerged from the culvert three nights ago.','His left boot appeared damaged.','A second person escaped across the river in a black skiff.']},onEnter:s=>{learn(s,'Old Bren saw an injured man emerge from the culvert three nights ago with blood on his cuff and a damaged left boot.');learn(s,'A second figure left the riverbank in a narrow black skiff.');},choices:[{label:'Pay 2 gold and use the postern',detail:'Enter discreetly with Bren’s help.',target:'posternPaid',cost:2,tone:'safe'},{label:'Return to the western gate',detail:'Enter through the official route.',target:'gate1',tone:'safe'}]},
    posternPaid:{act:'Act I',scene:'Inside the Wall',location:'Veycross — Westbank',place:'Westbank District',text:[
      `Two coins disappear into Bren's palm. He knocks three times against the door, pauses, and knocks once more. A bolt slides back from the other side.`,
      `You enter Veycross through a passage that smells of salt fish and lamp oil. No guard records your arrival.`
    ],result:{title:'Transaction Complete',changes:['Gold reduced by 2.','You entered Veycross discreetly.','Old Bren will remember that you paid without argument.']},onEnter:s=>{s.flags.secretEntry=true;},next:'city1'},
    city1:{act:'Act I',scene:'Veycross',location:'Veycross — Westbank',place:'Veycross',placeSummary:'A rain-polished river city of black stone, crowded bridges, guild towers, workshops, and steep lanes.',text:[
      `Inside the walls, Veycross feels larger than it appeared from the ridge. The western streets climb sharply from the river, paved with uneven blocks polished smooth by centuries of boots and wagon wheels. Buildings lean over the lanes as though listening to conversations below. Their lower floors are stone; their upper storeys are dark timber, painted plaster, and narrow windows glowing amber against the rain.`,
      `Everywhere, the city carries the sound of water. Gutters chatter. Mill wheels turn beneath the bridge. Rain strikes canvas awnings while the river moves below it all with a deep, continuous weight.`,
      `The great bridge dominates the district. Shops have been built along both sides of it, forming a covered street above the river. Beyond its eastern end rises the Lantern District, marked by the copper dome of the city archive and the tall, many-windowed tower of the lamplighters' guild.`
    ],next:'city2'},
    city2:{act:'Act I',scene:'The City Opens',location:'Veycross — Bridge Square',place:'Bridge Square',placeSummary:'The crowded western entrance to the great bridge, surrounded by inns, market stalls, and guild shops.',text:[
      `You reach Bridge Square as the rain eases. To your left, a hanging sign shaped like a crooked brass lantern turns slowly above the door of a broad three-storey inn. Across the square, a weapon-smith has opened her shutters, and the smell of hot metal drifts from within. The bridge itself leads east toward the archive.`,
      `For the first time since seeing the city from the ridge, several courses of action are equally reasonable. This is not a pause manufactured for the sake of choice. It is a genuine crossroads.`
    ],choices:[
      {label:'Enter the Crooked Lantern',detail:'Find Tomas Rook and ask what he knows about Elian Voss.',target:'inn1',tone:'social'},
      {label:'Visit the bridge market',detail:'Purchase supplies before beginning the investigation.',action:'shop',tone:'safe'},
      {label:'Go directly to the city archive',detail:'Inspect Voss’s workplace while the day is still young.',target:'archive1',tone:'risky'}
    ]},
    inn1:{act:'Act I',scene:'The Crooked Lantern',location:'Veycross — Crooked Lantern',place:'The Crooked Lantern',placeSummary:'A busy old inn overlooking Bridge Square, warm with firelight, polished wood, and the smell of bread.',text:[
      `Warmth reaches you before the door has fully closed. The Crooked Lantern is an old establishment built around a central stone hearth. Copper pans hang above the kitchen pass, and dozens of small lanterns—none hanging quite straight—cast gold light across dark beams and crowded tables.`,
      `Behind the bar stands Tomas Rook. He is a large man in his late fifties, broad through the chest and shoulders, with a carefully trimmed beard that has gone almost entirely silver. His left hand is missing the final joint of its smallest finger. Deep lines gather around pale grey eyes that seem friendly until you notice how little they miss.`,
      `He sets down the glass he has been polishing and looks once toward the door behind you.`
    ],speaker:{name:'Tomas Rook',role:'Proprietor of the Crooked Lantern',avatar:'T'},onEnter:s=>addContact(s,'Tomas Rook','A broad, silver-bearded innkeeper with observant grey eyes and part of one finger missing.'),next:'inn2'},
    inn2:{act:'Act I',scene:'A Careful Welcome',location:'Veycross — Crooked Lantern',place:'The Crooked Lantern',speaker:{name:'Tomas Rook',role:'Proprietor of the Crooked Lantern',avatar:'T'},text:[
      `“You look as though the March tried to keep you,” he says. His tone is mild, almost amused. “It usually succeeds.”`,
      `He places a dry cloth on the counter without being asked, then pours hot water into a cup with crushed mint leaves.`,
      `“Drink first. Questions sound wiser when your teeth aren't chattering.”`
    ],next:'inn3'},
    inn3:{act:'Act I',scene:'The Name of Voss',location:'Veycross — Crooked Lantern',place:'The Crooked Lantern',speaker:{name:'Tomas Rook',role:'Proprietor of the Crooked Lantern',avatar:'T'},text:[
      `The drink brings feeling back to your hands. Rook waits until you set the cup down.`,
      `When you mention Elian Voss, the innkeeper's attention shifts—not dramatically, but enough. The cloth in his hand stops moving.`,
      `“Elian rented the same upstairs room every Moonday for eleven years,” he says. “Three nights ago he came in on a Kingsday, asked for the room overlooking Bellmaker's Lane, and left through the kitchen before midnight.”`,
      `Rook reaches beneath the counter but does not yet remove his hand. “Before we continue, I need to know whether you came to find him, rob him, or finish whatever someone else started.”`
    ],choices:[
      {label:'Show Brother Aldren’s letter',detail:'Prove that your connection to Voss began outside the city.',target:'rookLetter',tone:'safe'},
      {label:'Tell him about the guard’s warning',detail:'Explain what Vale shared and test whether Rook trusts the Watch.',target:'rookVale',tone:'social'},
      {label:'Refuse to explain and demand the room key',detail:'Attempt to force the matter without earning his confidence.',check:{ability:'Intimidation',mod:0,dc:14,success:'rookIntimidateSuccess',failure:'rookIntimidateFail'},tone:'risky'}
    ]},
    rookLetter:{act:'Act I',scene:'What Voss Left Behind',location:'Veycross — Crooked Lantern',place:'The Crooked Lantern',speaker:{name:'Tomas Rook',role:'Proprietor of the Crooked Lantern',avatar:'T'},text:[
      `You show him the monastery seal. Rook does not touch the letter. Instead, he exhales slowly and removes a small iron key from beneath the counter.`,
      `“Then he was right to be afraid.”`,
      `Voss paid for the upstairs room through the end of the month and instructed Rook to surrender the key only to someone carrying Saint Orra's seal. Rook has not entered since the archivist vanished.`,
      `“Whatever is in that room,” he says, “someone has already killed—or come close to killing—for it.”`
    ],result:{title:'Trust Established',changes:['Tomas Rook accepted the monastery seal as proof.','You received the key to Voss’s rented room.','New location unlocked: Room Seven, overlooking Bellmaker’s Lane.']},onEnter:s=>{s.flags.roomKey=true;s.inventory.push({name:'Key to Room Seven',qty:1});s.objective='Search Voss’s rented room at the Crooked Lantern.';},next:'room1'},
    rookVale:{act:'Act I',scene:'The Watch and the Innkeeper',location:'Veycross — Crooked Lantern',place:'The Crooked Lantern',speaker:{name:'Tomas Rook',role:'Proprietor of the Crooked Lantern',avatar:'T'},text:[
      `At Vale's name, Rook's expression softens by a degree. “Mara doesn't spend trust carelessly.”`,
      `You repeat her warning about the searched cabinet. Rook listens without interruption, then produces a small iron key. He explains that Voss rented Room Seven and ordered him to release it only to someone Vale sent or someone carrying Saint Orra's seal.`,
      `“You have one of those things,” Rook says. “That is enough for me.”`
    ],result:{title:'Trust Established',changes:['Vale’s reputation convinced Rook to assist you.','You received the key to Room Seven.','Rook confirmed that Voss prepared for someone to follow him.']},onEnter:s=>{s.flags.roomKey=true;s.inventory.push({name:'Key to Room Seven',qty:1});s.objective='Search Voss’s rented room at the Crooked Lantern.';},next:'room1'},
    rookIntimidateSuccess:{act:'Act I',scene:'A Key Given Without Trust',location:'Veycross — Crooked Lantern',place:'The Crooked Lantern',speaker:{name:'Tomas Rook',role:'Proprietor of the Crooked Lantern',avatar:'T'},text:[
      `Your hand settles beside the sword at your hip—not drawing it, but making the possibility impossible to ignore. Rook's eyes harden.`,
      `He places the key on the counter. “Room Seven. Take what you came for and leave my staff out of it.”`,
      `You have gained access, but the warmth has gone from the conversation. Around the room, two patrons have noticed the exchange.`
    ],result:{title:'Pressure Succeeded',roll:true,changes:['You obtained the key to Room Seven.','Tomas Rook now distrusts you.','Your threatening behaviour was witnessed by other patrons.']},onEnter:s=>{s.flags.rookHostile=true;s.flags.roomKey=true;s.inventory.push({name:'Key to Room Seven',qty:1});s.objective='Search Voss’s rented room at the Crooked Lantern.';},next:'room1'},
    rookIntimidateFail:{act:'Act I',scene:'The Wrong Kind of Pressure',location:'Veycross — Crooked Lantern',place:'The Crooked Lantern',speaker:{name:'Tomas Rook',role:'Proprietor of the Crooked Lantern',avatar:'T'},text:[
      `You lean into the demand, but Rook does not retreat. The innkeeper's gaze drops briefly to your stance, and you realize too late that the broad shoulders are not merely the result of lifting barrels.`,
      `His shortened left hand closes around your wrist. With a precise turn, he forces your arm against the counter until pain flashes from your fingers to your shoulder.`,
      `“You are in my house,” he says quietly. “Ask properly—or leave.”`,
      `He releases you without further injury. The room has gone silent.`
    ],result:{title:'Pressure Failed',roll:true,hpLoss:1,cause:'Rook uses a practiced wrist lock to stop your threat and forces your arm painfully against the counter.',changes:['Health reduced by 1 from the restraint.','Rook refused to provide the key.','You may repair the conversation by revealing your evidence, or leave.']},onEnter:s=>{s.hp=Math.max(1,s.hp-1);s.flags.rookHostile=true;},choices:[{label:'Show the sealed letter',detail:'Abandon intimidation and prove why you came.',target:'rookLetter',tone:'safe'},{label:'Leave for the city archive',detail:'End the conversation before it becomes a fight.',target:'archive1',tone:'safe'}]},
    room1:{act:'Act I',scene:'Room Seven',location:'Veycross — Crooked Lantern, Room Seven',place:'Room Seven',placeSummary:'A narrow rented room overlooking Bellmaker’s Lane, preserved exactly as Voss left it.',text:[
      `Room Seven occupies the rear corner of the inn. It is narrow but clean, furnished with a bed, writing desk, washstand, and a single high-backed chair positioned beside the window. Bellmaker's Lane lies below, where rain drips from iron shop signs and runs between the cobbles.`,
      `Elian Voss left the room with deliberate neatness. The bed has not been slept in. A travelling coat hangs from a peg. Three books rest on the desk beside a cold lamp.`,
      `Yet one detail breaks the order: the chair by the window faces inward, toward the room, as if someone sat there waiting for the door to open.`
    ],choices:[
      {label:'Examine the writing desk',detail:'Search the books, lamp, and drawers for anything Voss left behind.',target:'desk1',tone:'safe'},
      {label:'Inspect the window and chair',detail:'Determine whether someone watched the room or entered from the lane.',check:{ability:'Investigation',mod:2,dc:12,success:'windowSuccess',failure:'windowFailure'},tone:'risky'},
      {label:'Search the travelling coat',detail:'Look for personal effects without disturbing the rest of the room.',target:'coat1',tone:'safe'}
    ]},
    desk1:{act:'Act I',scene:'The Desk Cipher',location:'Veycross — Crooked Lantern, Room Seven',place:'Room Seven',text:[
      `The desk drawers contain ordinary writing supplies, receipts, and a bundle of archive request slips. The three books appear unrelated: a history of bridge construction, a collection of river songs, and a legal commentary on inheritance.`,
      `Their page markers form a sequence—seven, nineteen, four. When you apply those numbers to the titles, the selected letters spell <em>V E Y</em>.`,
      `Beneath the lamp is a circular scratch in the wood. Turning the lamp base reveals a hidden compartment containing a thin brass token stamped with the number 47 and the emblem of a closed eye.`
    ],result:{title:'Search Result',changes:['You discovered Voss’s simple book cipher.','You found a brass token marked 47 and bearing a closed-eye emblem.','New quest item added to inventory.']},onEnter:s=>{s.inventory.push({name:'Brass token 47',qty:1});learn(s,'Voss concealed a brass token marked 47 beneath the lamp in Room Seven.');s.flags.token=true;s.objective='Discover what the closed-eye token opens or identifies.';},next:'roomCrossroads'},
    coat1:{act:'Act I',scene:'The Archivist’s Coat',location:'Veycross — Crooked Lantern, Room Seven',place:'Room Seven',text:[
      `The coat is expensive but worn at the cuffs. Its pockets hold a pencil, two copper coins, a folded tram schedule, and a torn strip of black sailcloth.`,
      `The sailcloth is wet despite the dry room. A faint smell of river tar clings to it. Sewn into one corner is a maker's mark: a crescent crossed by three vertical lines.`
    ],result:{title:'Search Result',changes:['New clue: Voss carried a wet strip of black sailcloth.','The cloth bears a crescent-and-three-lines maker’s mark.','The evidence may connect Voss to a boat on the river.']},onEnter:s=>learn(s,'A strip of black sailcloth found in Voss’s coat bears a crescent crossed by three lines.'),next:'roomCrossroads'},
    windowSuccess:{act:'Act I',scene:'Marks at the Window',location:'Veycross — Crooked Lantern, Room Seven',place:'Room Seven',text:[
      `You kneel beside the chair and study the floor at an angle. A faint line in the dust shows that the chair was dragged aside and then carefully returned.`,
      `The window latch bears fresh brass scratches. Outside, an iron rain pipe runs within arm's reach of the sill. Caught on one mounting bracket is a narrow fibre of black sailcloth.`,
      `Someone entered or left the room from Bellmaker's Lane without using the stairs.`
    ],result:{title:'Investigation Result',roll:true,changes:['You proved the window was opened from outside.','New clue: black sailcloth caught on the rain pipe.','You identified a covert route into Room Seven.']},onEnter:s=>{learn(s,'Someone climbed the rain pipe and opened the window of Room Seven from outside.');learn(s,'A fibre of black sailcloth was caught below Voss’s window.');},next:'roomCrossroads'},
    windowFailure:{act:'Act I',scene:'The Loose Casement',location:'Veycross — Crooked Lantern, Room Seven',place:'Room Seven',text:[
      `You lean over the sill to inspect the outer frame. A gust catches the casement and slams it against your hand. The edge clips two knuckles before you can pull away.`,
      `The pain is sharp but brief. More importantly, the impact shakes loose a narrow black fibre trapped beneath the latch. The latch itself is scratched, suggesting it was manipulated from outside.`
    ],result:{title:'Investigation Result',roll:true,hpLoss:1,cause:'A gust drives the loose window casement against your hand while you inspect the exterior frame.',changes:['Health reduced by 1 from bruised knuckles.','You still found black sailcloth beneath the latch.','You learned that the window was manipulated from outside.']},onEnter:s=>{s.hp=Math.max(1,s.hp-1);learn(s,'Someone appears to have opened the window of Room Seven from outside.');learn(s,'A fibre of black sailcloth was trapped beneath the window latch.');},next:'roomCrossroads'},
    roomCrossroads:{act:'Act I',scene:'Three Leads',location:'Veycross — Crooked Lantern, Room Seven',place:'Room Seven',text:[
      `By midday, the room has yielded enough to establish that Voss planned for someone to search it—and that another person may have entered through the window.`,
      `Three paths now offer meaningful progress. The city archive may explain what Voss was researching. The riverfront may identify the black sailcloth. The brass token, if you found it, may belong to one of Veycross's private societies or secure vaults.`
    ],choices:[
      {label:'Go to the city archive',detail:'Investigate Voss’s work and the cabinet searched after his disappearance.',target:'archive1',tone:'safe'},
      {label:'Investigate the riverfront',detail:'Ask shipwrights and boatmen about black sailcloth and its maker’s mark.',target:'riverfront1',tone:'social'},
      {label:'Return to Bridge Square',detail:'Restock, speak with Rook, or choose another route.',target:'city2',tone:'safe'}
    ]},
    archive1:{act:'Act I',scene:'The City Archive',location:'Veycross — Lantern District Archive',place:'The City Archive',placeSummary:'A copper-domed repository of civic records, old maps, legal rolls, and forbidden histories.',text:[
      `The city archive stands beneath a weathered copper dome in the Lantern District. Its entrance is flanked by statues of two blindfolded judges, their stone hands resting on open books.`,
      `Inside, the public hall smells of dust, leather, and lamp oil. Long tables fill the centre of the room, while iron galleries climb three storeys along the walls. At the far desk sits a young clerk with tightly curled auburn hair, round spectacles, and ink stains across both cuffs. He looks exhausted enough to have slept in his clothes.`,
      `Before you can speak, a crash echoes from the restricted stacks above. The clerk freezes. A second sound follows—the scrape of metal across stone.`
    ],speaker:{name:'Iven Pell',role:'Junior archive clerk',avatar:'I'},onEnter:s=>addContact(s,'Iven Pell','A young auburn-haired archive clerk with round spectacles and ink-stained cuffs.'),choices:[
      {label:'Run toward the restricted stacks',detail:'Respond immediately before whoever is above can escape.',target:'combatIntro',tone:'risky'},
      {label:'Ask Iven who should be upstairs',detail:'Take one moment to understand the danger before acting.',target:'ivenTalk',tone:'social'},
      {label:'Secure the main entrance',detail:'Prevent anyone from leaving through the public hall.',target:'secureDoor',tone:'safe'}
    ]},
    ivenTalk:{act:'Act I',scene:'A Name in the Stacks',location:'Veycross — City Archive',place:'The City Archive',speaker:{name:'Iven Pell',role:'Junior archive clerk',avatar:'I'},text:[
      `“No one,” Iven whispers. “The upper stacks are sealed while the Watch investigates.”`,
      `He tells you the noise came from Gallery C, where Voss kept pre-Imperial land records and confiscated correspondence. The only stair descends behind the reference desk, but a maintenance ladder opens onto Bellmaker's Lane.`,
      `Another crash sounds above. Dust falls from the gallery rail.`
    ],result:{title:'Tactical Information',changes:['You learned the intruder is in Gallery C.','You learned about a maintenance escape onto Bellmaker’s Lane.','You will enter the confrontation prepared.']},onEnter:s=>s.flags.combatPrepared=true,next:'combatIntro'},
    secureDoor:{act:'Act I',scene:'Closing the Net',location:'Veycross — City Archive',place:'The City Archive',text:[
      `You draw the main bolt across the public doors and move a reading stand in front of the smaller side exit. Iven understands immediately and pulls the alarm cord beneath his desk.`,
      `A bell begins ringing in the Watch office next door. Whoever is upstairs now has only one likely escape: the maintenance ladder into Bellmaker's Lane.`
    ],result:{title:'Position Secured',changes:['The public exits are blocked.','The Watch has been alerted.','The intruder has fewer escape routes during the coming confrontation.']},onEnter:s=>s.flags.combatPrepared=true,next:'combatIntro'},
    combatIntro:{act:'Act I',scene:'The Intruder in Gallery C',location:'Veycross — Archive Gallery C',place:'Gallery C',text:[
      `You climb the iron stair and enter Gallery C. Shelves form narrow aisles beneath the copper dome. At the far end, a figure in a dark oilskin coat is forcing documents into a leather satchel.`,
      `The intruder turns. He is wiry, perhaps thirty, with colourless blond hair cut close to the skull and a pale scar slicing through his left eyebrow. His left boot is split across the heel and bound with black cord.`,
      `He draws a hooked knife. “Walk back down,” he says, breathless but steady. “This is not worth dying over.”`
    ],result:{title:'Confrontation',changes:['You have identified the person sought by the gate guards.','His damaged boot matches evidence from the riverside.','Combat will begin only when you choose to act.']},choices:[
      {label:'Order him to surrender',detail:'Attempt to end the confrontation without bloodshed.',check:{ability:'Persuasion',mod:1,dc:13,success:'surrenderSuccess',failure:'combatStart'},tone:'social'},
      {label:'Draw your weapon',detail:'Begin combat and prevent him from escaping with the records.',action:'combat',tone:'risky'},
      {label:'Let him explain',detail:'Keep your distance and ask why he is stealing Voss’s files.',target:'intruderTalk',tone:'safe'}
    ]},
    intruderTalk:{act:'Act I',scene:'The Man with the Split Heel',location:'Veycross — Archive Gallery C',place:'Gallery C',speaker:{name:'Corven Ash',role:'Unknown agent',avatar:'C'},text:[
      `The knife remains raised, but the man does not advance. “Voss found proof that half this district was built over land stolen after the old rebellion. Proof with living names attached.”`,
      `He says Voss arranged to move the records before a group called the Closed Eye could destroy them. The plan failed at the river. Voss was wounded, and Corven does not know whether he survived.`,
      `Below, the alarm bell begins to ring. Corven glances toward the maintenance ladder.`
    ],result:{title:'Critical Information',changes:['The intruder identified himself as Corven Ash.','Voss was moving evidence of historic land theft.','A group called the Closed Eye may be destroying the evidence.','Voss was wounded near the river but may still be alive.']},onEnter:s=>{addContact(s,'Corven Ash','A wiry blond agent with a scar through his left eyebrow and a damaged left boot.');learn(s,'The Closed Eye is allegedly destroying evidence connected to historic land theft in Veycross.');learn(s,'Elian Voss was wounded during an attempted transfer of archive records near the river.');},choices:[
      {label:'Let Corven leave with the records',detail:'Trust his account and preserve the evidence outside official custody.',target:'letCorvenGo',tone:'risky'},
      {label:'Demand the satchel and offer safe surrender',detail:'Keep the evidence in the archive while asking him to trust the Watch.',check:{ability:'Persuasion',mod:1,dc:12,success:'surrenderSuccess',failure:'combatStart'},tone:'social'},
      {label:'Block the ladder and draw your weapon',detail:'Refuse to let him escape with the documents.',action:'combat',tone:'risky'}
    ]},
    surrenderSuccess:{act:'Act I',scene:'A Knife Lowered',location:'Veycross — Archive Gallery C',place:'Gallery C',speaker:{name:'Corven Ash',role:'Unknown agent',avatar:'C'},text:[
      `You do not reach for your weapon. Instead, you name the facts he cannot dismiss: the Watch is already coming, the exits are limited, and killing his way free would turn every uncertain accusation into a certainty of guilt.`,
      `Corven's grip loosens. The hooked knife falls to the floor. He keeps one hand on the satchel until Sergeant Vale reaches the gallery, then surrenders it directly to her.`,
      `Vale opens the satchel and finds Voss's notes on a place called Saint Brannoc's Pumping House beneath the east bank. One page bears a fresh blood smear and a message in Voss's hand: <em>Below the third wheel. Do not trust the magistrate.</em>`
    ],result:{title:'Conflict Resolved Without Combat',roll:true,changes:['Corven surrendered without injury.','The stolen records were preserved.','New destination: Saint Brannoc’s Pumping House.','New warning: do not trust the magistrate.','Experience gained: 35 XP.']},onEnter:s=>{s.xp+=35;s.objective='Reach Saint Brannoc’s Pumping House and search below the third wheel.';learn(s,'Voss left a message pointing to Saint Brannoc’s Pumping House: “Below the third wheel. Do not trust the magistrate.”');},next:'chapterEnd'},
    letCorvenGo:{act:'Act I',scene:'Evidence into the Rain',location:'Veycross — Archive Gallery C',place:'Gallery C',speaker:{name:'Corven Ash',role:'Agent opposing the Closed Eye',avatar:'C'},text:[
      `You step away from the ladder. Corven searches your face for deception, then lowers the knife.`,
      `Before climbing out, he tears one page from Voss's notebook and presses it into your hand. It contains a rough map of tunnels beneath the eastern riverbank and three words written twice: <em>the third wheel</em>.`,
      `“Saint Brannoc's Pumping House,” Corven says. “If Voss lived, that is where he went.”`,
      `He disappears into the rain with the remaining records moments before the Watch reaches the gallery.`
    ],result:{title:'A Risky Alliance',changes:['You allowed Corven to escape with the archive records.','You received Voss’s map to Saint Brannoc’s Pumping House.','Sergeant Vale will question why the intruder escaped.','Experience gained: 25 XP.']},onEnter:s=>{s.xp+=25;s.flags.corvenEscaped=true;s.objective='Reach Saint Brannoc’s Pumping House and search below the third wheel.';learn(s,'Voss’s map points to tunnels beneath Saint Brannoc’s Pumping House.');},next:'chapterEnd'},
    combatStart:{action:'combat'},
    riverfront1:{act:'Act I',scene:'Tar and Black Canvas',location:'Veycross — East Riverfront',place:'East Riverfront',placeSummary:'A working quay of cranes, narrow boats, ropewalks, and tar-dark shipyards.',text:[
      `The riverfront lies beneath the eastern end of the bridge. Cranes creak above barges unloading flour and slate. Ropemakers stretch hemp along covered walks while shipwrights work under sheds open to the river.`,
      `The black fabric from Voss's room is recognized by a sailmaker named Nella Quist—a compact woman with muscular forearms, copper-brown skin, and a cloud of greying curls tied back with blue cord. She identifies the crescent-and-three-lines mark as the sign of Harrow & Sons, makers of funeral barges and river skiffs.`,
      `Only one Harrow vessel currently uses black sailcloth: a narrow courier skiff called <em>The Quiet Wake</em>. It was reported stolen three nights ago and recovered empty near Saint Brannoc's Pumping House.`
    ],speaker:{name:'Nella Quist',role:'Sailmaker',avatar:'N'},onEnter:s=>{addContact(s,'Nella Quist','A compact sailmaker with strong forearms and greying curls tied in blue cord.');learn(s,'The black sailcloth came from The Quiet Wake, a skiff recovered near Saint Brannoc’s Pumping House.');s.objective='Investigate Saint Brannoc’s Pumping House on the east bank.';},result:{title:'Lead Confirmed',changes:['The sailcloth was identified.','The Quiet Wake was stolen the night Voss vanished.','The skiff was recovered near Saint Brannoc’s Pumping House.']},next:'chapterEnd'},
    chapterEnd:{act:'Act I',scene:'The Third Wheel',location:'Veycross',place:'Veycross',text:[
      `By late afternoon, the investigation has moved beyond a missing archivist. Voss uncovered evidence powerful people wanted erased. He was wounded near the river, and every surviving lead now points beneath an abandoned pumping house on the east bank.`,
      `The rain has stopped, but the river continues to rise. Across Veycross, lamplighters begin their evening rounds, touching flame to glass one street at a time.`,
      `This build ends at the first major campaign threshold. Your choices, contacts, clues, injuries, purchases, and alliances have been preserved in the save state. The next campaign act would begin beneath Saint Brannoc's third water wheel.`
    ],result:{title:'Act I Threshold Reached',changes:['The opening investigation is complete.','Your route through the city permanently affected what you learned and whom you trust.','The campaign state remains playable and saved locally.']},choices:[{label:'Return to Bridge Square',detail:'Continue exploring the implemented city systems.',target:'city2',tone:'safe'},{label:'Begin a new campaign',detail:'Reset all choices and replay a different route.',action:'new',tone:'risky'}]}
  };

  function render() {
    const node = nodes[state.node] || nodes.opening1;
    if (node.onEnter && !state.flags[`entered:${state.node}`]) { node.onEnter(state); state.flags[`entered:${state.node}`]=true; save(false); }
    el.locationName.textContent = node.location || 'Veycross';
    el.actLabel.textContent = (node.act || 'Act I').toUpperCase(); el.sceneLabel.textContent = node.scene || '';
    el.placeTitle.textContent = node.place || node.location || 'Veycross'; el.placeSummary.textContent = node.placeSummary || placeDescription(node.place);
    if (node.objective) state.objective=node.objective;
    updateHud(); renderSpeaker(node.speaker); renderText(node.text || []); renderResult(node.result); renderActions(node); renderWorld();
    el.storyCard.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'smooth'}); save(false);
  }

  function renderText(paragraphs) { el.storyContent.innerHTML = paragraphs.map((p,i)=>`<p class="${i===0?'scene-lead':''}">${p}</p>`).join(''); }
  function renderSpeaker(speaker){ if(!speaker){el.speakerBlock.classList.add('hidden');return;} el.speakerBlock.classList.remove('hidden');el.speakerAvatar.textContent=speaker.avatar||speaker.name[0];el.speakerName.textContent=speaker.name;el.speakerRole.textContent=speaker.role||''; }
  function renderResult(result){
    if(!result){el.resultLedger.classList.add('hidden');el.resultLedger.innerHTML='';return;}
    el.resultLedger.classList.remove('hidden');
    const r=state.lastRoll; const hpBefore=result.hpLoss ? state.hp+result.hpLoss : state.hp;
    let cells='';
    if(result.roll && r) cells+=`<div class="result-cell"><b>Roll</b><span>${r.raw} + ${r.mod} = ${r.total} vs DC ${r.dc}</span></div><div class="result-cell"><b>Outcome</b><span class="${r.success?'positive':'negative'}">${r.success?'Success':'Complication'}</span></div>`;
    if(result.hpLoss) cells+=`<div class="result-cell"><b>Health before</b><span>${hpBefore} HP</span></div><div class="result-cell"><b>Health change</b><span class="negative">−${result.hpLoss} HP → ${state.hp} HP</span></div>`;
    const cause=result.cause?`<div class="result-notes"><b>WHY THIS HAPPENED</b><p>${result.cause}</p></div>`:'';
    el.resultLedger.innerHTML=`<div class="result-head">${result.title}</div>${cells?`<div class="result-grid">${cells}</div>`:''}${cause}<div class="result-notes"><b>WHAT CHANGED</b><ul>${(result.changes||[]).map(c=>`<li>${c}</li>`).join('')}</ul></div>`;
  }
  function renderActions(node){
    el.actions.innerHTML='';
    if(node.next){addButton('Continue','Continue the current scene.',()=>go(node.next),'continue-button');return;}
    const choices=node.choices||[];
    if(choices.length){const label=document.createElement('div');label.className='choices-label';label.textContent='What do you do?';el.actions.appendChild(label);}
    choices.forEach(c=>addButton(c.label,c.detail,()=>choose(c),`choice ${c.tone||''}`));
    if(node.action==='combat') startCombat();
  }
  function addButton(label,detail,handler,className){const b=document.createElement('button');b.type='button';b.className=className;b.innerHTML=detail?`<strong>${label}</strong><span>${detail}</span>`:label;b.addEventListener('click',handler);el.actions.appendChild(b);}
  async function choose(c){
    if(c.cost && state.gold<c.cost){toast('You do not have enough gold.');return;}
    if(c.cost) state.gold-=c.cost;
    if(c.action==='shop'){openShop();return;} if(c.action==='combat'){startCombat();return;} if(c.action==='new'){newGame();return;}
    if(c.check){const roll=await rollDie(c.check.ability,c.check.mod,c.check.dc);state.lastRoll=roll;go(roll.success?c.check.success:c.check.failure);return;}
    go(c.target);
  }
  function go(target){state.node=target;state.lastRoll=null;render();}

  async function rollDie(ability,mod,dc){
    el.diceOverlay.classList.remove('hidden');el.diceOverlay.setAttribute('aria-hidden','false');el.dicePurpose.textContent=`${ability} check`;el.diceMath.textContent='Rolling…';el.die.classList.remove('rolling');void el.die.offsetWidth;el.die.classList.add('rolling');
    let raw=1;const ticker=setInterval(()=>{raw=Math.floor(Math.random()*20)+1;el.dieValue.textContent=raw;},70);
    await wait(1450);clearInterval(ticker);raw=Math.floor(Math.random()*20)+1;const total=raw+mod;el.dieValue.textContent=raw;el.diceMath.textContent=`${raw} + ${mod} = ${total} · DC ${dc}`;await wait(950);el.diceOverlay.classList.add('hidden');el.diceOverlay.setAttribute('aria-hidden','true');return{raw,mod,total,dc,success:total>=dc};
  }

  function startCombat(){
    state.combat={enemy:'Corven Ash',enemyHp:9,enemyMax:9,round:1,guarded:false};state.node='combatScene';renderCombat('Corven shifts sideways between the shelves, knife held low. He is looking for a path to the maintenance ladder.');
  }
  function renderCombat(message){
    const c=state.combat; el.locationName.textContent='Veycross — Archive Gallery C';el.actLabel.textContent='COMBAT';el.sceneLabel.textContent=`Round ${c.round}`;el.placeTitle.textContent='Gallery C';
    renderSpeaker({name:'Corven Ash',role:`Opponent · ${c.enemyHp}/${c.enemyMax} HP`,avatar:'C'});renderText([message,`The narrow aisle limits movement. Shelves provide partial cover, and the maintenance ladder is fifteen feet behind Corven. Your health is <strong>${state.hp}/${state.maxHp}</strong>.`]);
    el.resultLedger.classList.add('hidden');el.actions.innerHTML='<div class="choices-label">Choose your action</div>';
    addButton('Attack with shortsword','Roll to hit. On a hit, deal 1d6 + 2 damage.',()=>combatAttack(),'choice risky');
    addButton('Guard and block the ladder','Gain +2 Armour until Corven acts and deny his easiest escape.',()=>combatGuard(),'choice safe');
    addButton('Attempt to disarm him','A harder manoeuvre that can end the fight without serious injury.',()=>combatDisarm(),'choice social');
    updateHud();renderWorld();save(false);
  }
  async function combatAttack(){
    const roll=await rollDie('Attack',3,12);if(roll.success){const dmg=Math.floor(Math.random()*6)+3;state.combat.enemyHp=Math.max(0,state.combat.enemyHp-dmg);if(state.combat.enemyHp<=0){combatVictory(`Your blade strikes his forearm and knocks the hooked knife across the floor. Corven falls against the shelves, injured but alive. You stop the attack before it becomes fatal.`,dmg);return;}state.combat.round++;renderCombat(`Your shortsword catches Corven across the upper arm for ${dmg} damage. He staggers back, then uses a shelf as cover while searching for an opening.`);}else{await enemyTurn(`Your swing strikes the edge of a shelf. Corven twists away before the blade reaches him.`);}}
  async function combatGuard(){state.combat.guarded=true;await enemyTurn('You plant yourself between Corven and the ladder, forcing him to confront you instead of escaping.');}
  async function combatDisarm(){const roll=await rollDie('Athletics',1,14);if(roll.success){combatVictory('You catch his knife wrist with both hands, turn beneath his elbow, and drive the weapon against the shelf until his fingers open. The hooked blade falls. Corven raises both empty hands.',0);return;}await enemyTurn('You reach for his wrist, but he pulls the knife back and cuts a shallow line across your sleeve as he retreats.');}
  async function enemyTurn(prefix){const c=state.combat;const dc=state.ac+(c.guarded?2:0);const raw=Math.floor(Math.random()*20)+1;const total=raw+3;if(total>=dc){const dmg=Math.floor(Math.random()*4)+1;const before=state.hp;state.hp=Math.max(1,state.hp-dmg);c.round++;c.guarded=false;renderCombat(`${prefix} Corven answers with a quick cut that slips past your defence. The knife catches your side through the coat. You lose ${dmg} HP (${before} → ${state.hp}). The wound is painful but not disabling.`);}else{c.round++;c.guarded=false;renderCombat(`${prefix} Corven counters, but his hooked knife scrapes harmlessly across your guard. You take no damage.`);}}
  function combatVictory(text,dmg){state.combat=null;state.xp+=30;state.flags.corvenCaptured=true;state.objective='Search the captured records for Voss’s next destination.';learn(state,'Corven Ash was carrying Voss’s records and knew about the Closed Eye.');state.node='combatVictory';nodes.combatVictory={act:'Act I',scene:'The Satchel Recovered',location:'Veycross — Archive Gallery C',place:'Gallery C',speaker:{name:'Corven Ash',role:'Captured intruder',avatar:'C'},text:[text,`Inside the leather satchel are Voss's notes on Saint Brannoc's Pumping House. A message in the archivist's hand reads: <em>Below the third wheel. Do not trust the magistrate.</em>`],result:{title:'Combat Resolved',changes:[dmg?`Corven took ${dmg} damage in the final exchange.`:'Corven was disarmed without further injury.','You recovered the stolen archive records.','Experience gained: 30 XP.','New destination: Saint Brannoc’s Pumping House.']},onEnter:s=>learn(s,'Voss left a message pointing to Saint Brannoc’s Pumping House: “Below the third wheel. Do not trust the magistrate.”'),next:'chapterEnd'};render();}

  function openShop(){
    el.dialogEyebrow.textContent='BRIDGE MARKET';el.dialogTitle.textContent='Mira Fen’s Travelling Goods';
    const items=[{name:'Healing draught',desc:'Restore 4 HP when used. One-use item.',price:6},{name:'Hooded lantern',desc:'A reliable shuttered lantern for dark interiors.',price:4},{name:'Rope, 50 feet',desc:'Hemp rope suitable for climbing and securing loads.',price:3},{name:'Padded vest',desc:'Raises Armour to 13 if your current Armour is lower.',price:9}];
    el.dialogBody.innerHTML=`<div class="record-section"><h3>Mira Fen</h3><p>A tall woman in her thirties with tawny skin, a shaved left temple, and a long dark braid threaded with brass rings. She speaks quickly, but handles every item with careful respect.</p><p>You have <strong>${state.gold} gold</strong>.</p></div><div class="shop-grid">${items.map((i,n)=>`<div class="shop-item"><div><strong>${i.name} · ${i.price} gold</strong><span>${i.desc}</span></div><button class="shop-button" data-buy="${n}" ${state.gold<i.price?'disabled':''}>Buy</button></div>`).join('')}</div>`;
    el.dialogBody.querySelectorAll('[data-buy]').forEach(btn=>btn.addEventListener('click',()=>{const item=items[Number(btn.dataset.buy)];if(state.gold<item.price)return;state.gold-=item.price;if(item.name==='Padded vest')state.ac=Math.max(state.ac,13);else state.inventory.push({name:item.name,qty:1});addContact(state,'Mira Fen','A tall market trader with a shaved temple and brass-threaded braid.');toast(`Purchased ${item.name}.`);updateHud();openShop();save(false);}));el.panelDialog.showModal();
  }

  function updateHud(){el.characterName.textContent=state.character.name;el.characterClass.textContent=`${state.character.className} · Level ${state.character.level}`;el.portraitInitial.textContent=state.character.name[0];el.hpText.textContent=`${state.hp} / ${state.maxHp}`;el.hpBar.style.width=`${state.hp/state.maxHp*100}%`;el.xpText.textContent=`${state.xp} / 100`;el.xpBar.style.width=`${Math.min(100,state.xp)}%`;el.goldText.textContent=state.gold;el.acText.textContent=state.ac;el.timeText.textContent=state.time;el.weatherText.textContent=state.weather;el.objectiveText.textContent=state.objective;}
  function renderWorld(){el.recentList.innerHTML=state.learned.slice(-4).reverse().map(x=>`<li>${x}</li>`).join('')||'<li>No discoveries yet.</li>';el.contactsList.innerHTML=state.contacts.length?state.contacts.map(c=>`<span class="contact-chip" title="${escapeHtml(c.description)}">${escapeHtml(c.name)}</span>`).join(''):'<span class="empty">No one yet.</span>';}
  function placeDescription(place){const map={'The Western Gate':'A black-stone gatehouse controlling entry to the western half of Veycross.','Room Seven':'A private room overlooking Bellmaker’s Lane.','Gallery C':'Restricted archive shelves beneath the copper dome.'};return map[place]||'A place within the river city of Veycross.';}
  function learn(s,text){if(!s.learned.includes(text)){s.learned.push(text);s.journal.push({title:'Discovery',text});}}
  function addContact(s,name,description){if(!s.contacts.some(c=>c.name===name)){s.contacts.push({name,description});s.codex.push({title:name,text:description});}}
  function escapeHtml(v){return String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
  function showRecord(type){const isJournal=type==='journal';el.dialogEyebrow.textContent=isJournal?'YOUR STORY':'THE WORLD';el.dialogTitle.textContent=isJournal?'Journal':'Codex';const records=isJournal?state.journal:state.codex;const inventory=isJournal?`<div class="record-section"><h3>Inventory</h3><ul>${state.inventory.map(i=>`<li>${escapeHtml(i.name)}${i.qty>1?` ×${i.qty}`:''}</li>`).join('')}</ul></div>`:'';el.dialogBody.innerHTML=`${inventory}${records.map(r=>`<section class="record-section"><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.text)}</p></section>`).join('')}`;el.panelDialog.showModal();}
  function save(show=true){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));if(show)toast('Campaign saved.');}catch(err){console.error(err);if(show)toast('Save failed in this browser.');}}
  function load(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?JSON.parse(raw):null;}catch{return null;}}
  function newGame(){if(!confirm('Start a new campaign? This replaces the current local save.'))return;state=initialState();save(false);render();}
  function toast(msg){el.toast.textContent=msg;el.toast.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.toast.classList.add('hidden'),2200);}
  function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

  $('journalBtn').addEventListener('click',()=>showRecord('journal'));$('codexBtn').addEventListener('click',()=>showRecord('codex'));$('saveBtn').addEventListener('click',()=>save(true));$('newBtn').addEventListener('click',newGame);$('dialogClose').addEventListener('click',()=>el.panelDialog.close());
  window.addEventListener('load',()=>{render();if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js?v=longform-1').catch(()=>{});});
})();
