(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "wayfarersChronicleSave_v1";
  const abilities = ["str", "dex", "con", "int", "wis", "cha"];
  const abilityNames = { str:"Strength", dex:"Dexterity", con:"Constitution", int:"Intelligence", wis:"Wisdom", cha:"Charisma" };
  const standardArray = [15,14,13,12,10,8];

  const classData = {
    fighter: {
      hitDie: 10, primary: "str", ac: 16, weapon: "Longsword", damage: "1d8", damageType: "slashing",
      feature: "Second Wind", featureText: "Recover 1d10 + level hit points once per rest.",
      skills: 2, resources: { "Second Wind": 1 },
      recommended: {str:15, con:14, dex:13, wis:12, cha:10, int:8}
    },
    rogue: {
      hitDie: 8, primary: "dex", ac: 14, weapon: "Shortsword", damage: "1d6", damageType: "piercing",
      feature: "Sneak Attack", featureText: "Deal +1d6 damage once per turn when you have an opening.",
      skills: 4, resources: { "Sneak Attack": "1/turn" },
      recommended: {dex:15, con:14, cha:13, int:12, wis:10, str:8}
    },
    wizard: {
      hitDie: 6, primary: "int", ac: 12, weapon: "Fire Bolt", damage: "1d10", damageType: "fire",
      feature: "Arcane Recovery", featureText: "Recover one expended spell slot after a rest.",
      skills: 2, resources: { "Spell Slots": 2, "Arcane Recovery": 1 },
      recommended: {int:15, dex:14, con:13, wis:12, cha:10, str:8}
    },
    cleric: {
      hitDie: 8, primary: "wis", ac: 18, weapon: "Mace", damage: "1d6", damageType: "bludgeoning",
      feature: "Healing Word", featureText: "Restore 1d4 + Wisdom modifier hit points using a spell slot.",
      skills: 2, resources: { "Spell Slots": 2 },
      recommended: {wis:15, con:14, str:13, cha:12, dex:10, int:8}
    },
    ranger: {
      hitDie: 10, primary: "dex", ac: 15, weapon: "Longbow", damage: "1d8", damageType: "piercing",
      feature: "Hunter's Mark", featureText: "Mark a foe to deal +1d6 damage on successful weapon attacks.",
      skills: 3, resources: { "Hunter's Mark": 1 },
      recommended: {dex:15, wis:14, con:13, str:12, int:10, cha:8}
    },
    barbarian: {
      hitDie: 12, primary: "str", ac: 14, weapon: "Greataxe", damage: "1d12", damageType: "slashing",
      feature: "Rage", featureText: "Gain resistance to weapon damage and +2 melee damage for one battle.",
      skills: 2, resources: { "Rage": 2 },
      recommended: {str:15, con:14, dex:13, wis:12, cha:10, int:8}
    }
  };

  const ancestryData = {
    human: { speed:30, bonus:{}, trait:"Versatile" },
    elf: { speed:30, bonus:{dex:2}, trait:"Keen Senses" },
    dwarf: { speed:25, bonus:{con:2}, trait:"Dwarven Resilience" },
    halfling: { speed:25, bonus:{dex:2}, trait:"Lucky" },
    orc: { speed:30, bonus:{str:2, con:1}, trait:"Relentless Endurance" },
    tiefling: { speed:30, bonus:{cha:2}, trait:"Infernal Legacy" }
  };

  const backgrounds = {
    soldier: ["Athletics","Intimidation"],
    scholar: ["Arcana","History"],
    outlander: ["Survival","Nature"],
    criminal: ["Deception","Stealth"],
    acolyte: ["Insight","Religion"],
    artisan: ["Investigation","Persuasion"]
  };

  const skills = {
    Acrobatics:"dex", AnimalHandling:"wis", Arcana:"int", Athletics:"str",
    Deception:"cha", History:"int", Insight:"wis", Intimidation:"cha",
    Investigation:"int", Medicine:"wis", Nature:"int", Perception:"wis",
    Performance:"cha", Persuasion:"cha", Religion:"int", SleightOfHand:"dex",
    Stealth:"dex", Survival:"wis"
  };

  const sceneLibraries = {
    frontier: {
      locations:["the Ashen Crossroads","Fort Emberwatch","the Windscar Ravine","the old king's road","a ruined watchtower","the Hollowfield farms"],
      details:["wind rattles through thorn bushes","distant bells sound without rhythm","fresh tracks cross the mud","a column of smoke stains the horizon","crows circle above a broken mile marker"]
    },
    city: {
      locations:["the Lantern District","the sunken archive","Crowmarket","the old aqueduct","the Gilded Gate","an abandoned bathhouse"],
      details:["rain glitters on black cobblestones","masked figures vanish into the crowd","a bell tolls from beneath the street","shutters close as you approach","blue witchlight flickers in an upstairs window"]
    },
    wilds: {
      locations:["the Elderwood","Mossglass Fen","the Moonroot Trail","a ring of standing stones","the silver waterfall","the Briarheart clearing"],
      details:["the forest falls suddenly silent","glowing spores drift between ancient trunks","a wounded stag watches from the brush","roots twist into shapes resembling hands","something large moves beyond the tree line"]
    },
    isles: {
      locations:["Saltwind Harbour","the Shattered Reef","Blackgull Isle","a storm-battered lighthouse","the drowned temple","the cliffs of Veyra"],
      details:["thunder rolls beyond the horizon","the tide carries fragments of carved bone","sailors whisper and avert their eyes","green lightning crawls through the clouds","a bell rings from beneath the waves"]
    },
    underdark: {
      locations:["the Echoing Vault","Gloambridge","the fungal forest","a buried dwarven hall","the Obsidian Chasm","the crystal caverns"],
      details:["water drips in impossible rhythms","pale fungi pulse like sleeping hearts","a warm wind rises from below","distant hammering echoes through stone","shadows move against the direction of your torch"]
    }
  };

  const threatData = {
    cult: {
      name:"the Veiled Hand",
      enemies:[
        {name:"Veiled Initiate", ac:12, hp:9, attack:3, damage:"1d6+1", xp:50},
        {name:"Fanatical Adept", ac:13, hp:15, attack:4, damage:"1d8+2", xp:100},
        {name:"Masked Oracle", ac:14, hp:24, attack:5, damage:"1d10+2", xp:200}
      ],
      clues:["a wax seal bearing an eye","a coded prayer","a ritual dagger","a list of marked names"]
    },
    undead: {
      name:"the Hollow King",
      enemies:[
        {name:"Restless Skeleton", ac:13, hp:8, attack:4, damage:"1d6+2", xp:50},
        {name:"Gravebound Knight", ac:15, hp:18, attack:4, damage:"1d8+2", xp:100},
        {name:"Wight Captain", ac:14, hp:28, attack:5, damage:"1d10+3", xp:200}
      ],
      clues:["a blackened grave token","a fragment of burial cloth","a crown-shaped brand","soil that moves like ash"]
    },
    beasts: {
      name:"the Moonfang Brood",
      enemies:[
        {name:"Ravenous Wolf", ac:13, hp:10, attack:4, damage:"1d6+2", xp:50},
        {name:"Briarhide Boar", ac:14, hp:20, attack:4, damage:"1d8+3", xp:100},
        {name:"Moonfang Alpha", ac:15, hp:30, attack:5, damage:"1d10+3", xp:200}
      ],
      clues:["a tuft of silver fur","claw marks in solid stone","a half-eaten charm","tracks that become human footprints"]
    },
    warband: {
      name:"the Iron Jackals",
      enemies:[
        {name:"Jackal Scout", ac:13, hp:10, attack:4, damage:"1d6+2", xp:50},
        {name:"Iron Reaver", ac:15, hp:19, attack:4, damage:"1d8+2", xp:100},
        {name:"Jackal Warlord", ac:16, hp:32, attack:5, damage:"1d10+3", xp:200}
      ],
      clues:["a notched iron token","a stolen military map","a blood-red banner scrap","orders signed with a paw mark"]
    },
    arcane: {
      name:"the Unbound Convergence",
      enemies:[
        {name:"Warped Homunculus", ac:12, hp:9, attack:4, damage:"1d6+2", xp:50},
        {name:"Living Spell", ac:14, hp:17, attack:4, damage:"1d8+2", xp:100},
        {name:"Riftborn Horror", ac:15, hp:29, attack:5, damage:"1d10+3", xp:200}
      ],
      clues:["a crystal humming with heat","a page covered in moving ink","a glass feather","a compass that points upward"]
    }
  };

  const treasureTable = [
    {name:"healing potion", effect:"heal", value:8},
    {name:"silvered charm", effect:"ac", value:1},
    {name:"emberstone", effect:"damage", value:1},
    {name:"smoke bomb", effect:"escape", value:1},
    {name:"ancient coin", effect:"gold", value:15},
    {name:"scroll of warding", effect:"ward", value:1}
  ];

  let state = freshState();

  function freshState() {
    return {
      screen:"home",
      setup:null,
      character:null,
      scene:0,
      maxScenes:10,
      storySeed:Math.floor(Math.random()*99999999),
      quest:null,
      flags:{ clues:0, victories:0, failures:0, rested:false, finale:false },
      currentScene:null,
      combat:null,
      rollHistory:[],
      rngCounter:0,
      gameOver:false
    };
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i=0; i<str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededRandom() {
    let x = (state.storySeed + state.rngCounter++ * 0x6D2B79F5) >>> 0;
    x ^= x >>> 15; x = Math.imul(x, x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }

  function pick(arr) { return arr[Math.floor(seededRandom()*arr.length)]; }
  function cap(s) { return String(s).replace(/([A-Z])/g, " $1").replace(/^./, c=>c.toUpperCase()); }
  function mod(score) { return Math.floor((score-10)/2); }
  function signed(n) { return n >= 0 ? `+${n}` : `${n}`; }
  function rollRaw(sides) { return Math.floor(Math.random()*sides)+1; }

  function parseDice(formula) {
    const match = String(formula).trim().match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!match) throw new Error("Invalid dice formula");
    return { count:Number(match[1] || 1), sides:Number(match[2]), bonus:Number(match[3] || 0) };
  }

  async function rollDice(formula, label="Roll") {
    const {count,sides,bonus} = parseDice(formula);
    const die = $("dieVisual");
    die.classList.remove("rolling");
    void die.offsetWidth;
    die.classList.add("rolling");
    $("diceFormula").textContent = `${label}: ${formula}`;
    $("diceOutcome").textContent = "Rolling…";

    let flicker = 0;
    const timer = setInterval(() => {
      $("dieVisual").querySelector(".die-number").textContent = rollRaw(sides);
      flicker++;
      if (flicker > 8) clearInterval(timer);
    }, 65);

    await new Promise(resolve => setTimeout(resolve, 720));
    clearInterval(timer);

    const rolls = Array.from({length:count}, () => rollRaw(sides));
    const total = rolls.reduce((a,b)=>a+b,0)+bonus;
    $("dieVisual").querySelector(".die-number").textContent = total;
    $("diceOutcome").textContent = rolls.length > 1 || bonus ? `${rolls.join(" + ")}${bonus ? ` ${bonus>=0?"+":"-"} ${Math.abs(bonus)}`:""} = ${total}` : `${total}`;

    state.rollHistory.unshift(`${label}: ${formula} = ${total}`);
    state.rollHistory = state.rollHistory.slice(0,8);
    renderRollHistory();
    return { total, rolls, bonus, natural: rolls[0] };
  }

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(`screen-${name}`).classList.add("active");
    state.screen = name;
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function showToast(text) {
    const toast = $("toast");
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(()=>toast.classList.remove("show"), 2200);
  }

  function showMessage(title, text) {
    $("messageTitle").textContent = title;
    $("messageText").textContent = text;
    $("messageDialog").showModal();
  }

  function initAbilityGrid() {
    $("abilityGrid").innerHTML = abilities.map((a,i)=>`
      <div class="ability-card">
        <label>${abilityNames[a]}
          <select id="ability-${a}" data-ability="${a}">
            ${standardArray.map(v=>`<option value="${v}" ${v===standardArray[i]?"selected":""}>${v}</option>`).join("")}
          </select>
        </label>
        <div id="ability-mod-${a}" class="ability-mod">+0</div>
      </div>`).join("");
    document.querySelectorAll("[data-ability]").forEach(el=>el.addEventListener("change", ()=>{
      enforceUniqueScores(el);
      updateCharacterPreview();
    }));
  }

  function enforceUniqueScores(changed) {
    const selects = [...document.querySelectorAll("[data-ability]")];
    const values = selects.map(s=>Number(s.value));
    if (new Set(values).size !== values.length) {
      const duplicate = selects.find(s=>s!==changed && s.value===changed.value);
      const available = standardArray.find(v=>!values.includes(v) || v===Number(duplicate.value));
      if (duplicate && available !== undefined) duplicate.value = available;
    }
  }

  function setStats(stats) {
    abilities.forEach(a => $(`ability-${a}`).value = stats[a]);
    updateCharacterPreview();
  }

  function getBaseStats() {
    return Object.fromEntries(abilities.map(a=>[a, Number($(`ability-${a}`).value)]));
  }

  function getFinalStats() {
    const stats = getBaseStats();
    const ancestry = ancestryData[$("ancestry").value];
    Object.entries(ancestry.bonus).forEach(([a,v])=>stats[a]+=v);
    if ($("ancestry").value==="human") {
      abilities.forEach(a=>stats[a]+=1);
    }
    return stats;
  }

  function initSkills() {
    $("skillGrid").innerHTML = Object.keys(skills).map(skill=>`
      <label class="check"><input type="checkbox" name="skill" value="${skill}"> ${cap(skill)}</label>
    `).join("");
    document.querySelectorAll('input[name="skill"]').forEach(cb=>cb.addEventListener("change", enforceSkillLimit));
  }

  function enforceSkillLimit(e) {
    const max = classData[$("className").value].skills;
    const checked = [...document.querySelectorAll('input[name="skill"]:checked')];
    if (checked.length > max) {
      e.target.checked = false;
      showToast(`Choose up to ${max} trained skills.`);
    }
    $("skillHelp").textContent = `Choose ${max} skill${max===1?"":"s"}. Background skills are added automatically.`;
  }

  function calculatePreview() {
    const c = classData[$("className").value];
    const a = ancestryData[$("ancestry").value];
    const stats = getFinalStats();
    const hp = c.hitDie + mod(stats.con);
    const attack = 2 + mod(stats[c.primary]);
    let ac = c.ac;
    if (["rogue","wizard","ranger"].includes($("className").value)) ac += Math.max(0, mod(stats.dex)-2);
    return {c,a,stats,hp,attack,ac};
  }

  function updateCharacterPreview() {
    if (!$("ability-str")) return;
    const {c,a,stats,hp,attack,ac} = calculatePreview();
    $("previewName").textContent = $("charName").value.trim() || "Unnamed Hero";
    $("previewIdentity").textContent = `${cap($("ancestry").value)} ${cap($("className").value)} • ${cap($("background").value)}`;
    $("previewAC").textContent = ac;
    $("previewHP").textContent = hp;
    $("previewSpeed").textContent = a.speed;
    $("previewAttack").textContent = `${c.weapon} ${signed(attack)}`;
    $("previewDamage").textContent = `${c.damage} ${signed(mod(stats[c.primary]))} ${c.damageType}`;
    $("previewFeature").textContent = c.feature;
    $("previewFeatureText").textContent = c.featureText;
    $("previewStats").innerHTML = abilities.map(ab=>`
      <div class="preview-stat"><span>${ab.toUpperCase()}</span><strong>${stats[ab]}</strong><small>${signed(mod(stats[ab]))}</small></div>
    `).join("");
    abilities.forEach(ab=>$(`ability-mod-${ab}`).textContent=signed(mod(stats[ab])));
    $("skillHelp").textContent = `Choose ${c.skills} skill${c.skills===1?"":"s"}. Background skills are added automatically.`;
  }

  function createCharacter() {
    const preview = calculatePreview();
    const chosenSkills = [...document.querySelectorAll('input[name="skill"]:checked')].map(x=>x.value);
    if (chosenSkills.length !== preview.c.skills) {
      showToast(`Choose exactly ${preview.c.skills} trained skills.`);
      return false;
    }
    const bgSkills = backgrounds[$("background").value];
    const allSkills = [...new Set([...chosenSkills, ...bgSkills])];

    state.character = {
      name:$("charName").value.trim(),
      ancestry:$("ancestry").value,
      className:$("className").value,
      background:$("background").value,
      ideal:$("ideal").value.trim(),
      level:1,
      proficiency:2,
      stats:preview.stats,
      maxHp:preview.hp,
      hp:preview.hp,
      ac:preview.ac,
      speed:preview.a.speed,
      weapon:preview.c.weapon,
      damage:preview.c.damage,
      damageType:preview.c.damageType,
      attackBonus:preview.attack,
      feature:preview.c.feature,
      featureText:preview.c.featureText,
      skills:allSkills,
      resources:JSON.parse(JSON.stringify(preview.c.resources)),
      maxResources:JSON.parse(JSON.stringify(preview.c.resources)),
      inventory:["Adventurer's pack", preview.c.weapon, "Healing potion"],
      gold:10,
      xp:0,
      deathSuccess:0,
      deathFailure:0,
      conditions:[]
    };
    return true;
  }

  function initializeQuest() {
    const t = threatData[state.setup.threat];
    const startLoc = pick(sceneLibraries[state.setup.setting].locations);
    state.quest = {
      title:`The Shadow of ${t.name}`,
      objective:`Discover what ${t.name} seeks and stop it before the final omen is fulfilled.`,
      startLocation:startLoc
    };
    state.scene = 0;
    state.flags = { clues:0, victories:0, failures:0, rested:false, finale:false };
    generateScene("opening");
  }

  function sceneDC(type="normal") {
    const base = state.setup.difficulty==="story" ? 10 : state.setup.difficulty==="dangerous" ? 14 : 12;
    const scaling = Math.floor(state.scene/5);
    return base + scaling + (type==="hard"?2:type==="easy"?-2:0);
  }

  function generateScene(forcedType=null) {
    state.scene += 1;
    state.combat = null;
    $("combatPanel").classList.add("hidden");
    $("checkResult").classList.add("hidden");

    if (state.scene >= state.maxScenes || forcedType==="finale") {
      generateFinale();
      return;
    }

    const type = forcedType || chooseSceneType();
    const lib = sceneLibraries[state.setup.setting];
    const threat = threatData[state.setup.threat];
    const location = pick(lib.locations);
    const detail = pick(lib.details);

    let scene;
    if (type==="opening") {
      scene = {
        type,
        title:"A Stranger at the Threshold",
        location:state.quest.startLocation,
        text:[
          `${state.character.name} arrives at ${state.quest.startLocation} as ${detail}. A travel-worn messenger waits beneath a leaning signpost, one hand pressed to a bloodstained satchel.`,
          `“You look capable,” the stranger says. “Then perhaps you are the one meant to carry this.” Inside the satchel lies ${pick(threat.clues)} and a warning that ${threat.name} has begun moving openly.`,
          `The road ahead divides. One path follows the messenger's final directions. Another leads toward a nearby settlement where rumours may reveal more.`
        ],
        choices:[
          makeChoice("Follow the urgent trail", "Survival", sceneDC("normal"), "clue", "You take the direct route and search for signs."),
          makeChoice("Question the locals first", "Persuasion", sceneDC("easy"), "social", "You gather information before committing."),
          makeChoice("Study the strange evidence", "Investigation", sceneDC("normal"), "clue", "You examine the object for hidden meaning.")
        ]
      };
    } else if (type==="combat") {
      scene = {
        type,
        title:pick(["Steel in the Gloom","An Ambush Unfolds","The Hunter Becomes the Hunted","No Safe Road"]),
        location,
        text:[
          `At ${location}, ${detail}. Your instincts warn you a heartbeat before movement erupts from concealment.`,
          `A servant of ${threat.name} blocks your path. Whatever secrets this place holds, it has no intention of letting you carry them away.`
        ],
        choices:[
          {label:"Stand and fight", detail:"Enter combat", action:"combat"},
          makeChoice("Seek a tactical advantage first", "Perception", sceneDC("normal"), "combatAdvantage", "You scan the terrain for an opening."),
          makeChoice("Attempt to slip past unseen", "Stealth", sceneDC("hard"), "avoidCombat", "You move toward the nearest cover.")
        ]
      };
    } else if (type==="social") {
      const npc = pick(["a suspicious ferryman","an exhausted archivist","a masked herbalist","a disgraced guard captain","a wandering storyteller","a frightened apprentice"]);
      scene = {
        type,
        title:pick(["Words Behind Closed Doors","A Bargain in Low Voices","The Reluctant Witness","Trust Has a Price"]),
        location,
        text:[
          `You find ${npc} at ${location}. ${cap(detail)}.`,
          `The stranger knows something about ${threat.name}, but fear—or self-interest—keeps the truth guarded. Their eyes linger on your weapons, then on the road behind you.`
        ],
        choices:[
          makeChoice("Offer honest reassurance", "Persuasion", sceneDC("normal"), "clue", "You appeal to their better nature."),
          makeChoice("Read what they are hiding", "Insight", sceneDC("normal"), "clue", "You watch their reactions carefully."),
          makeChoice("Apply pressure", "Intimidation", sceneDC("hard"), "riskyClue", "You make the consequences of silence clear.")
        ]
      };
    } else if (type==="exploration") {
      scene = {
        type,
        title:pick(["Beyond the Known Path","A Door Without a Key","The Map Ends Here","Footprints of the Forgotten"]),
        location,
        text:[
          `${location} lies ahead. ${cap(detail)}.`,
          `The route appears abandoned, yet signs of recent passage remain: disturbed dust, a freshly broken branch, and a symbol associated with ${threat.name}. Somewhere nearby is a hidden way forward.`
        ],
        choices:[
          makeChoice("Track the recent passage", "Survival", sceneDC("normal"), "clue", "You follow the physical signs."),
          makeChoice("Search for concealed mechanisms", "Investigation", sceneDC("normal"), "treasure", "You examine the structure closely."),
          makeChoice("Trust your instincts", "Perception", sceneDC("normal"), "safePassage", "You stop looking and start listening.")
        ]
      };
    } else if (type==="rest") {
      scene = {
        type,
        title:"A Moment Between Dangers",
        location,
        text:[
          `For the first time in hours, ${location} offers defensible shelter. ${cap(detail)}.`,
          `You could risk a brief rest, search the area for useful supplies, or press onward while your enemy remains unaware of your exact position.`
        ],
        choices:[
          {label:"Take a short rest", detail:"Recover hit points and some resources", action:"rest"},
          makeChoice("Search for supplies", "Investigation", sceneDC("easy"), "treasure", "You search the shelter before leaving."),
          {label:"Press onward immediately", detail:"Gain momentum", action:"momentum"}
        ]
      };
    } else {
      scene = {
        type:"clue",
        title:pick(["The Pattern Revealed","A Sign in the Dark","The Enemy's Design","One Piece of the Truth"]),
        location,
        text:[
          `Within ${location}, you uncover ${pick(threat.clues)}. ${cap(detail)}.`,
          `The discovery is not enough to explain the entire plot, but it confirms one fact: ${threat.name} is preparing something at a place where old power still lingers.`
        ],
        choices:[
          makeChoice("Interpret the clue", "Arcana", sceneDC("normal"), "clue", "You search for magical significance."),
          makeChoice("Recall relevant history", "History", sceneDC("normal"), "clue", "You compare the evidence with old accounts."),
          {label:"Secure the evidence and continue", detail:"A cautious choice", action:"continue"}
        ]
      };
    }

    state.currentScene = scene;
    renderScene();
    autoSave();
  }

  function makeChoice(label, skill, dc, outcome, detail) {
    return {label, skill, dc, outcome, detail, action:"check"};
  }

  function chooseSceneType() {
    const emph = state.setup.emphasis;
    let pool = [];
    if (emph.includes("combat")) pool.push("combat","combat");
    if (emph.includes("exploration")) pool.push("exploration","clue");
    if (emph.includes("social")) pool.push("social");
    if (emph.includes("puzzles")) pool.push("clue");
    if (emph.includes("treasure")) pool.push("exploration");
    pool.push("combat","social","exploration","clue");
    if (state.scene > 2 && !state.flags.rested && state.character.hp < state.character.maxHp*.65) pool.push("rest","rest");
    return pick(pool);
  }

  function generateFinale() {
    state.flags.finale = true;
    const t = threatData[state.setup.threat];
    const lib = sceneLibraries[state.setup.setting];
    const location = pick(lib.locations);
    const readiness = state.flags.clues + state.flags.victories;
    state.currentScene = {
      type:"finale",
      title:`The Reckoning at ${cap(location)}`,
      location,
      text:[
        `Every clue has led here. At ${location}, ${t.name} begins the final stage of its design. The air tightens as old power gathers around the site.`,
        readiness >= 5
          ? `Because of what you learned along the way, you recognize the weakness in the ritual. This will still be dangerous, but you are not walking in blind.`
          : `Too many pieces remain uncertain. You have reached the heart of the danger, but the enemy still holds the advantage of surprise.`,
        `The architect of the threat turns to face you. “So,” it says, “the road finally delivers its champion.”`
      ],
      choices:[
        {label:"Break the ritual and confront the enemy", detail:"Final combat", action:"finalCombat"},
        makeChoice("Exploit the ritual's weakness", "Arcana", sceneDC(readiness>=5?"easy":"hard"), "finalAdvantage", "Use your gathered knowledge."),
        makeChoice("Turn the enemy's followers against them", "Persuasion", sceneDC("hard"), "finalSocial", "Make one last appeal.")
      ]
    };
    renderScene();
  }

  function renderScene() {
    const s = state.currentScene;
    $("chapterLabel").textContent = state.flags.finale ? "FINAL CHAPTER" : `CHAPTER ${toRoman(state.scene)}`;
    $("locationLabel").textContent = s.location.toUpperCase();
    $("sceneTitle").textContent = s.title;
    $("storyText").innerHTML = s.text.map(p=>`<p>${p}</p>`).join("");
    $("choiceList").innerHTML = s.choices.map((choice,i)=>`
      <button class="choice" data-choice="${i}">
        <span class="choice-index">${i+1}</span>
        <span><strong>${choice.label}</strong></span>
        <span class="choice-detail">${choice.detail || ""}${choice.skill ? ` • ${cap(choice.skill)} DC ${choice.dc}` : ""}</span>
      </button>`).join("");
    document.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click", ()=>handleChoice(s.choices[Number(btn.dataset.choice)])));
    renderSidebar();
  }

  async function handleChoice(choice) {
    disableChoices(true);
    if (choice.action==="check") {
      await resolveCheck(choice);
    } else if (choice.action==="combat") {
      startCombat(false, false);
    } else if (choice.action==="finalCombat") {
      startCombat(true, false);
    } else if (choice.action==="rest") {
      await takeRest();
      generateScene();
    } else if (choice.action==="momentum") {
      state.flags.clues += 1;
      showResult(true, "You move quickly enough to gain ground on your enemies.");
      setTimeout(()=>generateScene(), 1200);
    } else if (choice.action==="continue") {
      generateScene();
    }
    autoSave();
  }

  function disableChoices(disabled) {
    document.querySelectorAll("[data-choice]").forEach(b=>b.disabled=disabled);
  }

  async function resolveCheck(choice) {
    const skillKey = Object.keys(skills).find(k=>k.toLowerCase()===choice.skill.toLowerCase().replace(/\s/g,"")) || choice.skill;
    const ability = skills[skillKey] || skills[choice.skill] || "wis";
    const proficient = state.character.skills.some(s=>s.toLowerCase()===choice.skill.toLowerCase().replace(/\s/g,""));
    const bonus = mod(state.character.stats[ability]) + (proficient ? state.character.proficiency : 0);
    const roll = await rollDice(`1d20${bonus>=0?"+":""}${bonus}`, `${choice.skill} check`);
    const success = roll.total >= choice.dc || roll.natural===20;
    const criticalFailure = roll.natural===1;

    if (success) {
      showResult(true, `Success — ${roll.total} against DC ${choice.dc}.`);
      applyOutcome(choice.outcome, true);
    } else {
      showResult(false, `${criticalFailure ? "Critical failure" : "Failure"} — ${roll.total} against DC ${choice.dc}.`);
      applyOutcome(choice.outcome, false);
    }
  }

  function showResult(success, text) {
    const box = $("checkResult");
    box.className = `result-box ${success?"success":"failure"}`;
    box.textContent = text;
  }

  function applyOutcome(outcome, success) {
    if (success) {
      if (["clue","riskyClue","safePassage","finalSocial"].includes(outcome)) {
        state.flags.clues += outcome==="finalSocial" ? 2 : 1;
        state.character.xp += 20;
      }
      if (outcome==="treasure") awardTreasure();
      if (outcome==="combatAdvantage") {
        setTimeout(()=>startCombat(false, true), 900);
        return;
      }
      if (outcome==="avoidCombat") {
        state.character.xp += 25;
      }
      if (outcome==="finalAdvantage" || outcome==="finalSocial") {
        setTimeout(()=>startCombat(true, true), 900);
        return;
      }
    } else {
      state.flags.failures++;
      if (["combatAdvantage","avoidCombat"].includes(outcome)) {
        setTimeout(()=>startCombat(false, false), 900);
        return;
      }
      if (["finalAdvantage","finalSocial"].includes(outcome)) {
        setTimeout(()=>startCombat(true, false), 900);
        return;
      }
      const damage = Math.max(1, rollRaw(4));
      state.character.hp = Math.max(1, state.character.hp-damage);
      showToast(`The setback costs ${damage} HP.`);
    }
    renderSidebar();
    setTimeout(()=>generateScene(), 1400);
  }

  function awardTreasure() {
    const treasure = pick(treasureTable);
    state.character.inventory.push(cap(treasure.name));
    if (treasure.effect==="gold") state.character.gold += treasure.value;
    showToast(`Found: ${cap(treasure.name)}`);
  }

  async function takeRest() {
    const heal = await rollDice(`1d${classData[state.character.className].hitDie}+${Math.max(1,mod(state.character.stats.con))}`, "Hit Die");
    state.character.hp = Math.min(state.character.maxHp, state.character.hp + heal.total);
    state.flags.rested = true;
    if (state.character.className==="fighter") state.character.resources["Second Wind"]=1;
    if (state.character.className==="wizard") state.character.resources["Arcane Recovery"]=1;
    showResult(true, `You recover ${heal.total} hit points.`);
    renderSidebar();
  }

  async function startCombat(finale=false, advantage=false) {
    $("choiceList").innerHTML = "";
    $("combatPanel").classList.remove("hidden");
    const tier = finale ? 2 : state.scene > state.maxScenes*.55 ? 1 : 0;
    const template = threatData[state.setup.threat].enemies[tier];
    const difficultyMod = state.setup.difficulty==="dangerous" ? 4 : state.setup.difficulty==="story" ? -2 : 0;
    const enemy = {...template, maxHp:Math.max(4,template.hp+difficultyMod), hp:Math.max(4,template.hp+difficultyMod)};
    state.combat = {
      enemy,
      finale,
      advantage,
      playerTurn:false,
      raging:false,
      marked:false,
      dodging:false,
      enemyDisadvantage:false,
      initiativeDone:false
    };
    renderCombat();
    const pInit = await rollDice(`1d20${signed(mod(state.character.stats.dex))}`, "Your initiative");
    const eInit = rollRaw(20)+1;
    state.combat.initiativeDone = true;
    state.combat.playerTurn = advantage || pInit.total >= eInit;
    logCombat(`You roll ${pInit.total} initiative. ${enemy.name} rolls ${eInit}. ${state.combat.playerTurn ? "You act first." : `${enemy.name} acts first.`}`);
    renderCombatActions();
    if (!state.combat.playerTurn) setTimeout(enemyTurn, 850);
  }

  function renderCombat() {
    if (!state.combat) return;
    const e = state.combat.enemy;
    $("enemyName").textContent = e.name;
    $("enemyHP").textContent = Math.max(0,e.hp);
    $("enemyMaxHP").textContent = e.maxHp;
    $("enemyHpMeter").style.width = `${Math.max(0,e.hp/e.maxHp*100)}%`;
    renderSidebar();
    renderCombatActions();
  }

  function renderCombatActions() {
    const box = $("combatActions");
    if (!state.combat || !state.combat.playerTurn || state.gameOver) {
      box.innerHTML = "";
      return;
    }
    const c = state.character;
    const actions = [
      {id:"attack", label:`Attack with ${c.weapon}`, detail:`${signed(c.attackBonus)} to hit • ${c.damage} damage`},
      {id:"defend", label:"Defensive stance", detail:"Impose disadvantage on the next enemy attack"},
      {id:"potion", label:"Drink healing potion", detail:"Recover 2d4 + 2 HP"},
      {id:"flee", label:"Attempt to escape", detail:"Dexterity check"}
    ];
    if (c.className==="fighter" && Number(c.resources["Second Wind"])>0) actions.splice(2,0,{id:"secondWind",label:"Second Wind",detail:"Bonus healing, once per rest"});
    if (c.className==="cleric" && Number(c.resources["Spell Slots"])>0) actions.splice(2,0,{id:"healingWord",label:"Healing Word",detail:"Spend a spell slot to heal"});
    if (c.className==="barbarian" && Number(c.resources["Rage"])>0 && !state.combat.raging) actions.splice(1,0,{id:"rage",label:"Enter a Rage",detail:"+2 damage and weapon resistance"});
    if (c.className==="ranger" && Number(c.resources["Hunter's Mark"])>0 && !state.combat.marked) actions.splice(1,0,{id:"mark",label:"Hunter's Mark",detail:"+1d6 damage for this fight"});

    box.innerHTML = actions.map(a=>`<button data-combat="${a.id}"><strong>${a.label}</strong><br><small>${a.detail}</small></button>`).join("");
    box.querySelectorAll("[data-combat]").forEach(btn=>btn.addEventListener("click", ()=>combatAction(btn.dataset.combat)));
  }

  async function combatAction(action) {
    if (!state.combat?.playerTurn) return;
    state.combat.playerTurn = false;
    renderCombatActions();

    if (action==="attack") await playerAttack();
    else if (action==="defend") {
      state.combat.enemyDisadvantage = true;
      logCombat("You take a guarded stance, preparing to turn aside the next attack.");
    } else if (action==="potion") {
      const index = state.character.inventory.findIndex(x=>x.toLowerCase().includes("healing potion"));
      if (index < 0) {
        logCombat("You have no healing potion.");
        state.combat.playerTurn = true;
        renderCombatActions();
        return;
      }
      state.character.inventory.splice(index,1);
      const heal = await rollDice("2d4+2","Healing potion");
      state.character.hp = Math.min(state.character.maxHp,state.character.hp+heal.total);
      logCombat(`You drink a healing potion and recover ${heal.total} HP.`);
    } else if (action==="secondWind") {
      state.character.resources["Second Wind"]--;
      const heal = await rollDice(`1d10+${state.character.level}`,"Second Wind");
      state.character.hp = Math.min(state.character.maxHp,state.character.hp+heal.total);
      logCombat(`You draw on your reserves and recover ${heal.total} HP.`);
    } else if (action==="healingWord") {
      state.character.resources["Spell Slots"]--;
      const heal = await rollDice(`1d4${signed(mod(state.character.stats.wis))}`,"Healing Word");
      state.character.hp = Math.min(state.character.maxHp,state.character.hp+Math.max(1,heal.total));
      logCombat(`Divine power restores ${Math.max(1,heal.total)} HP.`);
    } else if (action==="rage") {
      state.character.resources["Rage"]--;
      state.combat.raging = true;
      logCombat("You enter a rage. Your melee attacks hit harder and weapon damage is reduced.");
    } else if (action==="mark") {
      state.character.resources["Hunter's Mark"]--;
      state.combat.marked = true;
      logCombat(`You mark ${state.combat.enemy.name} as your quarry.`);
    } else if (action==="flee") {
      const check = await rollDice(`1d20${signed(mod(state.character.stats.dex))}`,"Escape");
      if (check.total >= sceneDC("normal")) {
        logCombat("You escape the encounter.");
        state.combat = null;
        $("combatPanel").classList.add("hidden");
        setTimeout(()=>generateScene(),900);
        return;
      }
      logCombat("Your escape route is cut off.");
    }

    renderCombat();
    if (state.combat && state.combat.enemy.hp>0) setTimeout(enemyTurn,850);
  }

  async function playerAttack() {
    const c = state.character;
    const attack = await rollDice(`1d20${signed(c.attackBonus)}`, `${c.weapon} attack`);
    const crit = attack.natural===20;
    if (attack.total >= state.combat.enemy.ac || crit) {
      let damageFormula = c.damage + signed(mod(c.stats[classData[c.className].primary]));
      let dmg = await rollDice(damageFormula, crit ? "Critical damage" : "Damage");
      let total = Math.max(1,dmg.total);
      if (crit) {
        const extra = await rollDice(c.damage,"Critical die");
        total += extra.total;
      }
      if (c.className==="rogue") {
        const sneak = await rollDice("1d6","Sneak Attack");
        total += sneak.total;
      }
      if (state.combat.raging && ["fighter","barbarian"].includes(c.className)) total += 2;
      if (state.combat.marked) {
        const mark = await rollDice("1d6","Hunter's Mark");
        total += mark.total;
      }
      if (c.inventory.some(x=>x.toLowerCase()==="emberstone")) total += 1;
      state.combat.enemy.hp -= total;
      logCombat(`${crit ? "Critical hit! " : ""}You strike for ${total} ${c.damageType} damage.`);
      if (state.combat.enemy.hp <= 0) {
        winCombat();
      }
    } else {
      logCombat(`Your attack misses AC ${state.combat.enemy.ac}.`);
    }
  }

  async function enemyTurn() {
    if (!state.combat || state.combat.enemy.hp<=0 || state.gameOver) return;
    const e = state.combat.enemy;
    let natural, total;
    if (state.combat.enemyDisadvantage) {
      const a = rollRaw(20), b = rollRaw(20);
      natural = Math.min(a,b);
      total = natural + e.attack;
      await animateManualRoll(total, `${e.name} attack`, `2d20 disadvantage + ${e.attack}`);
      state.combat.enemyDisadvantage = false;
    } else {
      const attack = await rollDice(`1d20+${e.attack}`, `${e.name} attack`);
      natural = attack.natural;
      total = attack.total;
    }
    if (total >= state.character.ac || natural===20) {
      const dmg = await rollDice(e.damage, `${e.name} damage`);
      let actual = Math.max(1,dmg.total);
      if (state.combat.raging) actual = Math.max(1,Math.floor(actual/2));
      state.character.hp -= actual;
      logCombat(`${e.name} hits you for ${actual} damage.`);
      if (state.character.hp <= 0) {
        state.character.hp = 0;
        await deathSaveSequence();
        return;
      }
    } else {
      logCombat(`${e.name} misses your AC ${state.character.ac}.`);
    }
    state.combat.playerTurn = true;
    renderCombat();
  }

  async function animateManualRoll(total,label,formula) {
    const die = $("dieVisual");
    die.classList.remove("rolling");
    void die.offsetWidth;
    die.classList.add("rolling");
    $("diceFormula").textContent = `${label}: ${formula}`;
    $("diceOutcome").textContent = "Rolling…";
    await new Promise(r=>setTimeout(r,720));
    die.querySelector(".die-number").textContent = total;
    $("diceOutcome").textContent = `${total}`;
    state.rollHistory.unshift(`${label}: ${formula} = ${total}`);
    state.rollHistory = state.rollHistory.slice(0,8);
    renderRollHistory();
  }

  async function deathSaveSequence() {
    logCombat("You fall unconscious. Fate hangs on a death saving throw.");
    const save = await rollDice("1d20","Death save");
    if (save.natural===20) {
      state.character.hp = 1;
      state.character.deathSuccess = 0;
      state.character.deathFailure = 0;
      logCombat("Natural 20 — you regain consciousness with 1 HP.");
      state.combat.playerTurn = true;
      renderCombat();
      return;
    }
    if (save.total>=10) state.character.deathSuccess++;
    else state.character.deathFailure += save.natural===1 ? 2 : 1;

    if (state.character.deathSuccess>=3) {
      state.character.hp=1;
      state.character.deathSuccess=0;
      state.character.deathFailure=0;
      logCombat("Three successes. You stabilize and regain 1 HP.");
      state.combat.playerTurn=true;
      renderCombat();
    } else if (state.character.deathFailure>=3) {
      loseGame();
    } else {
      logCombat(`Death saves: ${state.character.deathSuccess} successes, ${state.character.deathFailure} failures.`);
      setTimeout(deathSaveSequence,900);
    }
  }

  function winCombat() {
    const c = state.character;
    const e = state.combat.enemy;
    c.xp += e.xp;
    c.gold += 3 + Math.floor(seededRandom()*10);
    state.flags.victories++;
    logCombat(`${e.name} falls. You gain ${e.xp} XP.`);
    renderCombat();
    checkLevelUp();

    const wasFinale = state.combat.finale;
    state.combat = null;
    setTimeout(()=>{
      $("combatPanel").classList.add("hidden");
      if (wasFinale) endGame(true);
      else generateScene();
    },1500);
  }

  function checkLevelUp() {
    const thresholds = [0,300,900,2700];
    const c = state.character;
    if (c.level < 4 && c.xp >= thresholds[c.level]) {
      c.level++;
      const hpGain = classData[c.className].hitDie > 8 ? 7 : classData[c.className].hitDie===8 ? 5 : 4;
      c.maxHp += hpGain + Math.max(0,mod(c.stats.con));
      c.hp = c.maxHp;
      if (c.level===3) c.proficiency=2;
      showMessage("Level Up!", `${c.name} reaches level ${c.level}. Maximum hit points increase and all hit points are restored.`);
    }
  }

  function loseGame() {
    state.gameOver = true;
    state.combat = null;
    $("combatPanel").classList.add("hidden");
    $("sceneTitle").textContent = "The Chronicle Ends";
    $("storyText").innerHTML = `<p>${state.character.name}'s journey ends before the threat can be stopped. Yet stories have a way of being retold, and another path may lead to a different fate.</p>`;
    $("choiceList").innerHTML = `<button id="restartFromSave" class="primary">Return to Main Menu</button>`;
    $("restartFromSave").addEventListener("click",()=>showScreen("home"));
    autoSave();
  }

  function endGame(victory) {
    state.gameOver = true;
    const t = threatData[state.setup.threat];
    $("sceneTitle").textContent = victory ? "A Chronicle Worth Remembering" : "A Bitter Ending";
    $("storyText").innerHTML = victory
      ? `<p>${state.character.name} breaks the power of ${t.name}. Dawn reaches ${state.currentScene.location} as the gathered darkness scatters, and those who survived begin speaking your name with hope.</p>
         <p>You finish the adventure at level ${state.character.level} with ${state.character.xp} XP, ${state.character.gold} gold, ${state.flags.clues} major clues, and ${state.flags.victories} victories.</p>`
      : `<p>The threat survives, but so do you. The road remains open for another attempt.</p>`;
    $("choiceList").innerHTML = `
      <button id="epilogueBtn" class="primary">Generate an Epilogue</button>
      <button id="newAdventureBtn" class="secondary">Begin Another Chronicle</button>`;
    $("epilogueBtn").addEventListener("click",generateEpilogue);
    $("newAdventureBtn").addEventListener("click",resetGame);
    autoSave();
  }

  function generateEpilogue() {
    const endings = [
      `${state.character.name} becomes a quiet guardian of the roads, appearing wherever travellers vanish and old dangers wake.`,
      `Years later, bards still argue over which parts of the tale are true. ${state.character.name} never corrects them.`,
      `The recovered clues become the foundation of a new order dedicated to watching for the return of forgotten powers.`,
      `${state.character.name} returns home, but the map now seems smaller—and the horizon far more inviting.`
    ];
    $("storyText").innerHTML += `<p><strong>Epilogue:</strong> ${pick(endings)}</p>`;
    $("epilogueBtn").disabled = true;
  }

  function logCombat(text) {
    $("combatLog").textContent = text;
  }

  function renderSidebar() {
    const c = state.character;
    if (!c) return;
    $("sideName").textContent = c.name;
    $("sideIdentity").textContent = `${cap(c.ancestry)} ${cap(c.className)}`;
    $("sideLevel").textContent = c.level;
    $("sideHP").textContent = Math.max(0,c.hp);
    $("sideMaxHP").textContent = c.maxHp;
    $("sideAC").textContent = c.ac;
    $("sideXP").textContent = c.xp;
    $("sideGold").textContent = c.gold;
    $("hpMeter").style.width = `${Math.max(0,c.hp/c.maxHp*100)}%`;
    $("inventoryList").innerHTML = c.inventory.length ? c.inventory.map(i=>`<li>${i}</li>`).join("") : "<li>Empty</li>";
    $("resourceList").innerHTML = Object.entries(c.resources).map(([k,v])=>`<div class="resource-item"><span>${k}</span><strong>${v}</strong></div>`).join("");
    $("questText").textContent = state.quest?.objective || "";
  }

  function renderRollHistory() {
    $("rollHistory").innerHTML = state.rollHistory.map(x=>`<li>${x}</li>`).join("");
  }

  function openCharacterSheet() {
    const c = state.character;
    $("dialogName").textContent = c.name;
    $("dialogIdentity").textContent = `${cap(c.ancestry)} ${cap(c.className)} • ${cap(c.background)} • Level ${c.level}`;
    $("dialogContent").innerHTML = `
      <div class="dialog-grid">
        <section class="dialog-section">
          <h3>Core Statistics</h3>
          <p>HP ${c.hp}/${c.maxHp} • AC ${c.ac} • Speed ${c.speed}</p>
          ${abilities.map(a=>`<p>${abilityNames[a]}: <strong>${c.stats[a]} (${signed(mod(c.stats[a]))})</strong></p>`).join("")}
        </section>
        <section class="dialog-section">
          <h3>Combat</h3>
          <p><strong>${c.weapon}</strong></p>
          <p>Attack ${signed(c.attackBonus)}</p>
          <p>Damage ${c.damage} ${signed(mod(c.stats[classData[c.className].primary]))} ${c.damageType}</p>
          <p>${c.feature}: ${c.featureText}</p>
        </section>
        <section class="dialog-section">
          <h3>Skills</h3>
          <p>${c.skills.map(cap).join(", ")}</p>
        </section>
        <section class="dialog-section">
          <h3>Identity</h3>
          <p>Ancestry trait: ${ancestryData[c.ancestry].trait}</p>
          <p>Ideal: ${c.ideal || "Not recorded."}</p>
          <p>Conditions: ${c.conditions.length ? c.conditions.join(", ") : "None"}</p>
        </section>
      </div>`;
    $("sheetDialog").showModal();
  }

  function toRoman(num) {
    const map = [[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    let out="";
    for (const [v,s] of map) while(num>=v){out+=s;num-=v;}
    return out;
  }

  function saveGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("continueBtn").classList.remove("hidden");
    showToast("Chronicle saved.");
  }

  function autoSave() {
    if (state.character) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadGame() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      showToast("No saved chronicle found.");
      return;
    }
    try {
      state = JSON.parse(raw);
      if (!state.character) throw new Error("Invalid save");
      showScreen("game");
      renderSidebar();
      renderRollHistory();
      if (state.currentScene) renderScene();
      if (state.combat) {
        $("combatPanel").classList.remove("hidden");
        renderCombat();
      }
      showToast("Chronicle loaded.");
    } catch (err) {
      showMessage("Save Error","The saved chronicle could not be read.");
    }
  }

  function resetGame() {
    if (state.character && !confirm("Start a new chronicle? Your current autosave will be replaced once the new story begins.")) return;
    state = freshState();
    showScreen("home");
    $("continueBtn").classList.toggle("hidden", !localStorage.getItem(STORAGE_KEY));
  }

  function bindEvents() {
    $("beginBtn").addEventListener("click",()=>showScreen("setup"));
    $("continueBtn").addEventListener("click",loadGame);
    $("saveBtn").addEventListener("click",saveGame);
    $("loadBtn").addEventListener("click",loadGame);
    $("resetBtn").addEventListener("click",resetGame);

    document.querySelectorAll("[data-nav]").forEach(btn=>btn.addEventListener("click",()=>showScreen(btn.dataset.nav)));

    $("setupForm").addEventListener("submit",(e)=>{
      e.preventDefault();
      const emphasis = [...document.querySelectorAll('#setupForm input[type="checkbox"]:checked')].map(x=>x.value);
      state.setup = {
        tone:$("tone").value,
        setting:$("setting").value,
        threat:$("threat").value,
        length:$("length").value,
        difficulty:$("difficulty").value,
        emphasis:emphasis.length ? emphasis : ["exploration"],
        seed:$("seed").value.trim()
      };
      state.storySeed = hashString(state.setup.seed || `${Date.now()}-${Math.random()}`);
      state.maxScenes = {short:6, medium:10, long:16}[state.setup.length];
      showScreen("character");
      updateCharacterPreview();
    });

    ["charName","ancestry","className","background"].forEach(id=>$(id).addEventListener("input",()=>{
      if (id==="className") {
        document.querySelectorAll('input[name="skill"]').forEach(x=>x.checked=false);
      }
      updateCharacterPreview();
    }));

    $("recommendedStatsBtn").addEventListener("click",()=>setStats(classData[$("className").value].recommended));
    $("randomStatsBtn").addEventListener("click",()=>{
      const shuffled = [...standardArray].sort(()=>Math.random()-.5);
      setStats(Object.fromEntries(abilities.map((a,i)=>[a,shuffled[i]])));
    });

    $("characterForm").addEventListener("submit",(e)=>{
      e.preventDefault();
      if (!createCharacter()) return;
      initializeQuest();
      showScreen("game");
      renderSidebar();
      autoSave();
    });

    $("openSheetBtn").addEventListener("click",openCharacterSheet);
    document.querySelectorAll("[data-die]").forEach(btn=>btn.addEventListener("click",()=>rollDice(`1d${btn.dataset.die}`,`Free d${btn.dataset.die}`)));
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
    }
  }

  function init() {
    initAbilityGrid();
    initSkills();
    bindEvents();
    updateCharacterPreview();
    $("continueBtn").classList.toggle("hidden", !localStorage.getItem(STORAGE_KEY));
    registerServiceWorker();
  }

  init();
})();
