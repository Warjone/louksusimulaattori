import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, DollarSign, RefreshCw, Briefcase, Pizza, Wifi, ShieldAlert, 
  HeartPulse, Sparkles, User, ArrowRight, Activity, AlertTriangle, Zap, Frown, 
  Skull, Ghost, Gift, AlertOctagon, Home, Wallet, Grid, X, Check, MoreHorizontal,
  Smile, Meh, Monitor, Dna,  Beer, Glasses, Gavel, Store, Key, Lock, MapPin, Building, BookOpen, Coffee, ShoppingBag, Footprints, Users, Trophy, Cherry, Bot, MessageSquare, Flame, Video, Fish
} from 'lucide-react';

// --- DATA: CHARACTERS ---

const CHARACTERS = [
  { id: 'mika', name: 'Mika-Matti', perk: 'Karismaattinen', desc: 'Avaa "Hurmaa" -dialogivaihtoehdot.', bonus: { charm: true } },
  { id: 'vesa', name: 'Vesa', perk: 'Vakaa', desc: 'Mielenterveys laskee 50% hitaammin.', bonus: { sanityResist: true } },
  { id: 'janne', name: 'Janne', perk: 'Onnekas', desc: 'Parempi tuuri tavaroiden löytämisessä.', bonus: { luck: true } },
  { id: 'ville', name: 'Ville', perk: 'Kalamies', desc: 'Myy kalaa. Avaa "Kauppias" -dialogivaihtoehdot (+30€/pvä).', bonus: { merchant: true } },
  { id: 'tomi', name: 'Tomi', perk: 'Selviytyjä', desc: 'Mukana Sorkkarauta (Uhkailu).', bonus: { item: 'Sorkkarauta' } },
  { id: 'lauri', name: 'Lauri', perk: 'Sijoittaja', desc: 'Omistaa ComCrashin osakkeita (Tuottaa 60€/päivä).', bonus: { cash: 300, share: 'internet' } },
];

// --- DATA: THE TOWN (BOARD) ---
const BOARD_MAP = [
  { id: 'start', label: 'Koti', type: 'start', color: 'bg-indigo-200' },
  { 
    id: 'louksu', label: 'Louksun Ranta', type: 'prop', cost: 150, income: 10, owner: null, color: 'bg-blue-200', icon: <Beer size={16}/>, benefit: 'Ilmaiset juomat (+Järki)',
    actions: [
      { label: 'Tuijota järvelle', type: 'rest', cost: 0, sanity: 10, text: "Tuijotat vettä. Vesi tuijottaa takaisin." },
      { label: 'Notskipaikka', type: 'buy', cost: 10, item: 'Smirnoff Ice', text: "Joit Smirnoff Icen ja hyppäsit laiturilta vaatteet päällä.", icon: <Flame size={14}/> },
      { label: 'Kerää pulloja', type: 'steal', risk: 0.2, item: 'Roska', text: "Etsit panttipulloja puskista." }
    ]
  },
  { id: 'tax', label: 'Verotoimisto', type: 'event', effect: 'tax', val: 100, color: 'bg-red-200' },
  { 
    id: 'kiosk', label: 'Taiston Kioski', type: 'prop', cost: 300, income: 25, owner: null, color: 'bg-green-200', icon: <DollarSign size={16}/>, benefit: 'Suoja Taiston veloilta',
    actions: [
      { label: 'Osta Tupakkaa', type: 'buy', cost: 15, item: 'Tupakka', text: "Pahaa keuhkoille, hyvää hermoille." },
      { label: 'Osta Irtokarkkeja', type: 'buy', cost: 5, item: 'Karkkipussi', text: "Sokerihumala!" },
      { label: 'Pölli Tupakkaa', type: 'steal', risk: 0.6, item: 'Tupakka', text: "Taisto selasi rave-tuloksia. Helppo nakki." }
    ]
  },
  { 
    id: 'nulju', label: 'Nuljun piha', type: 'prop', cost: 200, income: 15, owner: null, color: 'bg-yellow-200', icon: <Key size={16}/>, benefit: 'Manu kunnioittaa sinua',
    actions: [
      { label: 'Hengaile', type: 'rest', cost: 0, sanity: 5, text: "Nojailit seinään ja näytit coolilta." },
      { label: 'Riko aitaa', type: 'steal', risk: 0.5, item: 'Laudanpätkä', text: "Potkaisit laudan irti. Miksi?" },
      { label: 'Murtaudu kouluun', type: 'steal', risk: 0.8, item: 'Liitutaulu', text: "Hiivit sisään ikkunasta. Koulun hälyttimet eivät soineet... vielä." },
      { label: 'Kuvaa PiPo-video', type: 'rest', cost: 0, sanity: 15, text: "Hyppäsit katolta lumihankeen. 'PiPo Team rules!'", icon: <Video size={14}/> }
    ]
  },
  { 
    id: 'kentta', label: 'Pikku-Kenttä', type: 'prop', cost: 250, income: 20, owner: null, color: 'bg-pink-200', icon: <Gavel size={16}/>, benefit: 'Vittuämmä ei voi haastaa oikeuteen',
    actions: [
        { label: 'Pelaa Manhattania', type: 'rest', cost: 0, sanity: 15, text: "Heittelit korista poikien kanssa. Rankkaa settiä.", icon: <Trophy size={14}/> },
        { label: 'Varasta Marjoja', type: 'steal', risk: 0.6, item: 'Marjat', text: "Hiivit Vittuämmän puskalle. Verhot heiluivat ikkunassa.", icon: <Cherry size={14}/> },
        { label: 'Istuskele', type: 'rest', cost: 0, sanity: 5, text: "Istuskelet penkillä kuuntelemassa juoruja." }
    ]
  },
  { id: 'chance', label: 'Sattuma', type: 'event', effect: 'chance', color: 'bg-purple-300' },
  { 
    id: 'store', label: 'Kreetan Kauppa', type: 'prop', cost: 400, income: 35, owner: null, color: 'bg-orange-200', icon: <HeartPulse size={16}/>, benefit: 'Ilmaiset karkit päivittäin',
    actions: [
      { label: 'Osta Kondomeja', type: 'buy', cost: 10, item: 'Kondomit', text: "Turvallisuus ensin." },
      { label: 'Osta Olutta', type: 'buy', cost: 6, item: 'Olut', text: "Kreetta tuomitsee sinut katseellaan." },
      { label: 'Pölli Kondomit', type: 'steal', risk: 0.4, item: 'Kondomit', text: "Kreetta on hidas, mutta silmät on tarkat." },
      { label: 'Juoksukaljat', type: 'steal', risk: 0.7, item: 'Olut', text: "Kaikki peliin yhden lagerin takia." }
    ]
  },
  { id: 'scam', label: 'Paanasen Penkki', type: 'event', effect: 'scam', color: 'bg-gray-200' },
  { 
    id: 'milla', label: 'Milla-Makia', type: 'prop', cost: 450, income: 40, owner: null, color: 'bg-rose-300', icon: <Coffee size={16}/>, benefit: 'Löydät "hukattuja" tavaroita',
    actions: [
      { label: 'Osta Kahvi', type: 'buy', cost: 4, item: 'Kahvi', text: "Kuuma ja musta." },
      { label: 'Etsi Biljardikeppiä', type: 'search', risk: 0.3, item: 'Biljardikeppi', text: "Ryömit pöytien alla." }
    ]
  },
  { id: 'library', label: 'Nuolialan kirjasto', type: 'prop', cost: 350, income: 30, owner: null, color: 'bg-cyan-200', icon: <BookOpen size={16}/>, benefit: 'Habbo Hotel -pääsy (+Järki)' },
  { 
    id: 'palma', label: 'Pizzeria Palma', type: 'prop', cost: 500, income: 50, owner: null, color: 'bg-red-200', icon: <Pizza size={16}/>, benefit: 'Pizza parantaa tuplasti',
    actions: [
      { label: 'Osta Kebab', type: 'buy', cost: 12, item: 'Kebab', text: "Extra valkosipulilla." },
      { label: 'Pölli Limu', type: 'steal', risk: 0.5, item: 'Lämmin Limu', text: "Nappasit tölkin jääkaapista." }
    ]
  },
  { id: 'jail', label: 'Poliisi', type: 'event', effect: 'jail', color: 'bg-slate-800 text-white' },
];

// --- DYNAMIC DIALOGUE GENERATOR ---

const getCallerDialogue = (callerId, history = { count: 0, lastDay: -100, affinity: 50 }, day) => {
  const daysSinceLast = day - (history.lastDay || -100);
  const isRecent = daysSinceLast < 7;
  const affinity = history.affinity || 50; 
  
  const isFriendly = affinity > 65;
  const isHostile = affinity < 35;

  const CALLER_DB = {
    taisto: {
      name: 'Taisto (Kioski)',
      face: { bg: 'bg-green-800', text: 'text-white', accessory: <DollarSign size={16}/>, mood: 'serious' },
      stages: [
        { 
          nodes: {
            root: {
                text: isFriendly 
                  ? "Pomo! Hyvä nähdä. Kattelin tilejä, sulla on pieni piikki auki, mut ei kiirettä." 
                  : "Joo, Taisto tässä. Kattelen tilikirjaa. Punainen väri sattuu silmiin. Sulla on 80€ velkaa vuoden '99 irtokarkeista.",
                options: [
                    { text: "Maksan heti (80€)", cost: 80, sanity: 5, rel: 15, next: 'paid' },
                    { text: isFriendly ? "Kiitti Taisto" : "Ei oo rahaa Taisto", rel: isFriendly ? 5 : -10, next: isFriendly ? 'exit' : 'broke' },
                    { text: "Kuka antoi tän numeron?", rel: -20, next: 'angry' },
                    { text: "[Uhkailu] Sorkkarauta puhuu", reqItem: 'Sorkkarauta', rel: -30, next: 'intimidated' }
                ]
            },
            paid: {
                text: "Hyvä. Olet kunnian mies. Tai pelon. Ihan sama. Käteinen on käteistä. Mulla ois... takavarikoituja ilotulitteita. Kiinnostaako?",
                options: [
                    { text: "Joo, myy mulle raketteja (20€)", cost: 20, rel: 10, rewardItem: 'Ilotulitteet', next: 'sold_fireworks' },
                    { text: "Ei kiitos", next: 'exit' }
                ]
            },
            broke: {
                text: "Ei rahaa? Tässä taloustilanteessa? Pettymys. Mun kaverit yleensä katkoo jalkoja vähemmästäkin. Mut mä tykkään susta. Älä poistu kaupungista.",
                options: [
                    { text: "En poistu", next: 'exit' },
                    { text: "Muutan pois", rel: -10, next: 'threat' }
                ]
            },
            angry: {
                text: "Mulla on silmät joka paikassa. Nuljun pihalla. Kirjastossa. Jopa saunassa. Älä kysele tyhmiä. Maksa velkas.",
                options: [
                    { text: "Selvä (80€)", cost: 80, rel: 5, next: 'paid' },
                    { text: "Tuu hakeen jos uskallat", rel: -50, next: 'threat' }
                ]
            },
            intimidated: { text: "Oho, rauhotu. Ei tarvita väkivaltaa. Unohdetaan velka. Hullu...", options: [{ text: "Niin arvelinkin", next: 'exit' }] },
            threat: { text: "Klik. (Puhelu katkesi. Kuulet auton moottorin äänen ulkoa.)", options: [{ text: "Voi ei...", next: 'exit' }] },
            sold_fireworks: { text: "Oli ilo asioida. Nää on laittomia 12 maassa. Pidä hauskaa.", options: [{ text: "Moikka", next: 'exit' }] }
          }
        }
      ]
    },
    hagert: {
      name: 'J. Hagert',
      face: { bg: 'bg-slate-900', text: 'text-yellow-400', accessory: <Glasses size={16}/>, mood: 'cool' },
      stages: [
        {
          nodes: {
            root: {
                text: isHostile 
                  ? "Sinä. Kuulin että oot jutellu poliisien kanssa. Mä en myy rotille." 
                  : "Päivää ystävä! Aurinko paistaa, vai mitä? Mutta ranteesi... se on alaston. Se huutaa kultaa. Mulla ois Rolex. Löyty puistonpenkiltä.",
                options: isHostile 
                  ? [{ text: "En oo vasikka!", rel: 5, next: 'persuade' }] 
                  : [
                    { text: "Aito Rolex? Paljonko?", next: 'price' },
                    { text: "Toi on selvä feikki", rel: -5, next: 'fake' },
                    { text: "Ei kiinnosta", next: 'persuade' }
                ]
            },
            price: {
                text: "Sulle? 50€. Kaupassa? 5000€. Mä käytännössä annan sulle rahaa. Älä loukkaa mua sanomalla ei.",
                options: [
                    { text: "Kaupat (50€)", cost: 50, rel: 20, rewardItem: 'Kultakello', next: 'sold' },
                    { text: "Mulla on vaan kymppi", next: 'poor' },
                    { text: "[Kauppias] Tarjoan 30€", req: 'merchant', cost: 30, rel: 10, rewardItem: 'Kultakello', next: 'sold' }
                ]
            },
            fake: {
                text: "Feikki? FEIKKI?! Tää on aito 'Rollex' kahdella L-kirjaimella! Tuplasti luksusta! Loukkaat mun perheen kunniaa!",
                options: [
                    { text: "Sori, ostan sen (50€)", cost: 50, rel: 10, rewardItem: 'Kultakello', next: 'sold' },
                    { text: "Häivy Hagert", rel: -20, next: 'exit' }
                ]
            },
            persuade: {
                text: "Oota! Mulla on kans aurinkolasit. Ray-Banit. Tom Cruisen... serkun käyttämät. Todella harvinaiset. 20€. Kaupat?",
                options: [
                    { text: "Okei, anna lasit (20€)", cost: 20, rel: 10, rewardItem: 'Aurinkolasit', next: 'sold_shades' },
                    { text: "Ei!", rel: -5, next: 'exit' }
                ]
            },
            sold: { text: "Bisnes luistaa. Näytät ihan kuninkaalta. Jos kello pysähtyy, ravista sitä. Kovaa.", options: [{ text: "Kiitti", next: 'exit' }] },
            sold_shades: { text: "Näytät vaaralliselta. Tykkään siitä. Älä kerro poliisille mistä sait nää.", options: [{ text: "Moro", next: 'exit' }] },
            poor: { text: "Kymppi?! Mitä mä kympillä saan? Kebabin? ...Itseasiassa, mulla on nälkä. Anna se kymppi.", options: [{text: "Tässä (10€)", cost:10, rel: 15, next: 'exit'}]}
          }
        }
      ]
    },
    kreetta: {
      name: 'Kreetta (Kauppa)',
      face: { bg: 'bg-yellow-100', text: 'text-yellow-800', accessory: <HeartPulse size={16}/>, mood: 'sad' },
      stages: [
        {
          nodes: {
            root: {
                text: isFriendly 
                  ? "Voi hei kulta! Ajattelinkin juuri sinua. Säästin sinulle parhaat karkit."
                  : "Haloo? Onko siellä ketään? Kauppa on niin hiljainen. Kuulen kuinka maito happanee. Taisto vie kaikki asiakkaat tarjoamalla piikkiä ja kukkia.",
                options: [
                    { text: "Tulen ostamaan jotain", rel: 5, next: 'sales' },
                    { text: "Taisto on kyllä aika kova", rel: -20, next: 'traitor' },
                    { text: "Jää eläkkeelle Kreetta", rel: -10, next: 'crying' },
                    { text: "[Hurmaa] Olet kauniimpi kuin kukat", req: 'charm', rel: 20, next: 'charmed' }
                ]
            },
            sales: {
                text: "Ihan totta? Mulla on erikoiserä 'Vintage' karkkeja. Vuodelta 1998. Todella sitkeitä. Tai löysin hyllyn takaa kondomeja.",
                options: [
                    { text: "Otan karkit (5€)", cost: 5, rel: 5, rewardItem: 'Vanhat Karkit', next: 'sold_candy' },
                    { text: "Anna ne kondomit (10€)", cost: 10, rel: 5, rewardItem: 'Kondomit', next: 'sold_condoms' }
                ]
            },
            traitor: {
                text: "Petturi! Kaiken sen jälkeen mitä tein vuoksesi! Annoin sulle ilmaisen tikkarin kun olit viisi! Häivy elämästäni!",
                options: [{ text: "Anteeksi...", next: 'exit' }]
            },
            charmed: {
                text: "Voi... voi sentään! Poskeni punottavat! Olet sinä melkoinen hurmuri. Saat tikkarin kaupan päälle.",
                options: [{ text: "Kiitos Kreetta", next: 'sales' }]
            },
            crying: {
                text: "Eläkkeelle? Ja tekisin mitä? Syöttäisin puluja? Tää kauppa on mun elämä! *Niisk*",
                options: [{ text: "Anteeksi, älä itke", rel: 5, next: 'sales' }, { text: "Sulje puhelin", rel: -5, next: 'exit' }]
            },
            sold_candy: { text: "Kiitos kulta. Älä pure liian kovaa, hammas voi lohjeta.", options: [{ text: "Moi", next: 'exit' }] },
            sold_condoms: { text: "Pysy turvassa. Nää on... kestäviä. Luulisin.", options: [{ text: "Kiitti", next: 'exit' }] }
          }
        }
      ]
    },
    manu: {
      name: 'Manu (Talonmies)',
      face: { bg: 'bg-blue-800', text: 'text-white', accessory: <Key size={16}/>, mood: 'angry' },
      stages: [
        {
          nodes: {
            root: {
                text: isFriendly
                  ? "Päivää kansalainen. Raportoin vain, että Nuljun Pihan aita on turvattu. Kiitos lahjoituksesi."
                  : "Tässä Manu. Katselen Nuljun Pihan valvontakameroita. Joku... sylkäisi... asfaltille. Olitko se sinä?",
                options: isFriendly
                  ? [{ text: "Jatka hyvää työtä", rel: 5, next: 'exit' }]
                  : [
                    { text: "En! En ole käynyt siellä!", next: 'interrogate' },
                    { text: "Ehkä? Joskus syljeskelen.", next: 'confess' },
                    { text: "Se oli Paananen!", rel: -5, next: 'snitch' }
                ]
            },
            interrogate: {
                text: "Valehtelet! Tunnistan kävelytyylisi! Laahaat vasenta jalkaa! Se on 20€ sakko eritteiden levittämisestä!",
                options: [
                    { text: "Selvä, ota se (20€)", cost: 20, rel: 5, next: 'paid' },
                    { text: "Tule perimään jos uskallat", rel: -20, next: 'threat' }
                ]
            },
            confess: {
                text: "Ahaa! Tunnustus! Teillä huligaaneilla ei ole kunnioitusta julkista omaisuutta kohtaan. Pitäisi soittaa poliisille, mutta tyydyn 30€ lahjukseen.",
                options: [
                    { text: "Okei (30€)", cost: 30, rel: 10, next: 'paid' },
                    { text: "Oon PA", next: 'threat' }
                ]
            },
            snitch: {
                text: "Paananen? Se juoppo? Kyllä... se kuulostaa häneltä. Näin hänet hoipertelemassa liukumäen lähellä. Okei, pääset pälkähästä. Mutta tarkkailen sinua.",
                options: [{ text: "Kiitti Manu", next: 'exit' }]
            },
            paid: { text: "Vastaanotettu. Ensi kerralla niele se. Iljettävä sukupolvi.", options: [{ text: "Moi", next: 'exit' }] },
            threat: { text: "Vai kova jätkä? Mulla on yleisavain jokaiseen oveen tässä kylässä. Muista se kun menet nukkumaan.", options: [{ text: "...", next: 'exit' }] }
          }
        }
      ]
    },
    vittuamma: {
      name: 'Vittuämmä',
      face: { bg: 'bg-pink-600', text: 'text-white', accessory: <Gavel size={16}/>, mood: 'angry' },
      stages: [
        { 
          nodes: {
            root: {
                text: isHostile 
                  ? "MINÄ SOITAN POLIISILLE! Näin sinun hengittävän minun ilmaa!"
                  : "MINÄ NÄIN SUT! Astuit nurmikolle Pikku-Kentällä! Siinä lukee 'Ei nurmikolle'! Mulla on kuvatodisteet! Soitan kaupunginjohtajalle!",
                options: [
                    { text: "En se minä ollut!", next: 'deny' },
                    { text: "Anteeksi, maksan sakon", rel: 5, next: 'bribe' },
                    { text: "Ihan sama mummo", rel: -20, next: 'insult' },
                    { text: "[Hurmaa] Oletpa kaunis tänään", req: 'charm', rel: 15, next: 'charmed' }
                ]
            },
            deny: {
                text: "VALEHTELIJA! Näin sun kengät! Ne on rumat kengät! Vain sinulla on sellaiset! Myönnä!",
                options: [
                    { text: "Okei, okei. Paljonko?", next: 'bribe' },
                    { text: "Suljen puhelimen", next: 'exit' }
                ]
            },
            bribe: {
                text: "Hmph. Selvä. 'Sakko' on 10€ henkisestä kärsimyksestä jota ruoho koki. Maksa.",
                options: [
                    { text: "Maksa 10€", cost: 10, rel: 5, sanity: 5, next: 'paid' },
                    { text: "Ei oo rahaa", rel: -10, next: 'poor' }
                ]
            },
            charmed: {
                text: "Kaunis? Minäkö? ...No, laitoin kyllä uutta huulipunaa. Ehkä näin väärin. Ehkä se oli joku toinen huligaani. Mutta varoitan sinua!",
                options: [{ text: "Näkemiin rouva", next: 'exit' }]
            },
            paid: { text: "Hyväksyn. Mutta katselen sinua kiikareilla. Älä luule että ollaan ystäviä.", options: [{ text: "Moi", next: 'exit' }] },
            poor: { text: "Sitten nähdään käräjillä! HÄPEÄ!", options: [{ text: "Klik", next: 'exit' }] },
            insult: { text: "HÄVYTÖNTÄ! HAASTAN SUT OIKEUTEEN! TUNNEN SUN ÄITIS!", options: [{ text: "Luuri korvaan", next: 'exit' }] }
          }
        }
      ]
    },
    reijo: {
      name: 'Reijo (Löytöliiteri)',
      face: { bg: 'bg-orange-200', text: 'text-orange-900', accessory: <Store size={16}/>, mood: 'sweaty' },
      stages: [
        {
          nodes: {
            root: {
                text: "Ole kiltti... osta Löytöliiteri tyhjäksi. Mulla on 5000 muoviämpäriä eikä sielua jäljellä. Kaikki pitää myydä. Olen epätoivoinen.",
                options: [
                    { text: "Kerro ämpäreistä", next: 'buckets' },
                    { text: "Otan Mysteerilaatikon (50€)", cost: 50, rel: 20, sanity: 10, rewardItem: 'random', next: 'sold_box' },
                    { text: "Näkemiin Reijo", next: 'exit' },
                    { text: "[Kauppias] Ostan koko varaston (50€)", req: 'merchant', cost: 50, rel: 30, next: 'sold_stock' }
                ]
            },
            buckets: {
                text: "Ne on punaisia. Muovia. Kestäviä. Voit laittaa niihin vettä. Tai kyyneleitä. Osta edes yksi.",
                options: [
                    { text: "Ostan yhden (5€)", cost: 5, rel: 5, rewardItem: 'Ämpäri', next: 'sold_bucket' },
                    { text: "Ei kiitos", rel: -5, next: 'exit' }
                ]
            },
            sold_box: { text: "Siunausta! Ei palautusoikeutta! Se voi olla liimaa, se voi olla kultaa. Todennäköisesti liimaa.", options: [{ text: "Kiitti", next: 'exit' }] },
            sold_stock: { text: "Koko varaston?! Olet enkeli! Olen vapaa! Olen vihdoin vapaa ämpäreistä!", options: [{ text: "Ole hyvä", next: 'exit' }] },
            sold_bucket: { text: "Yksi ämpäri myyty! Vain 4999 jäljellä! Olen rikas!", options: [{ text: "Hyvä sulle", next: 'exit' }] }
          }
        }
      ]
    },
    paananen: {
      name: 'Paananen',
      face: { bg: 'bg-purple-300', text: 'text-purple-900', accessory: <Beer size={16}/>, mood: 'dizzy' },
      stages: [
        {
          nodes: {
            root: {
                text: isFriendly 
                  ? "Mun paras kaveri! *Röyh* Mä rakastan sua äijä. Oisko heittää hilusia?"
                  : "Mmmhheyyy... kaveri. Mä ja pojat... menossa Louksun rantaan. Tarvittais femma. Vaan 5 euroa. Ihan vaan... kulttuuritoimintaan.",
                options: [
                    { text: "Mitä toimintaa?", next: 'info' },
                    { text: "Tässä 5€, pidä hauskaa", cost: 5, rel: 15, sanity: 15, next: 'thanks' },
                    { text: "Mene töihin", rel: -10, next: 'angry' }
                ]
            },
            info: {
                text: "Tiäkkö... luonnon tarkkailua. Nestemäistä luontoa. Pullossa. Se on tiedettä, bro.",
                options: [
                    { text: "Kuulostaa aidolta. Tässä (5€)", cost: 5, rel: 10, sanity: 15, next: 'thanks' },
                    { text: "Ei käy", next: 'exit' }
                ]
            },
            thanks: { text: "Oot kuningas! KUNINGAS! Nimeän mun esikoisen sun mukaan! Tai mun seuraavan koiran!", options: [{ text: "Mene kotiin Paananen", next: 'exit' }] },
            angry: { text: "Mulla on työ! Olen maisteluasiantuntija! Luuletko olevas parempi ku minä?! *Hic*", options: [{ text: "Kyllä", next: 'exit' }] }
          }
        }
      ]
    },
    milla: {
      name: 'Milla (Milla-Makia)',
      face: { bg: 'bg-rose-500', text: 'text-white', accessory: <Coffee size={16}/>, mood: 'serious' },
      stages: [{ nodes: { root: { text: "Kuule, mun onnenbiljardikeppi on hukassa. Joku käveli sen kanssa ulos eilen. Olitko se sinä vai se juoppo Paananen?", options: [{text:"En ole nähnyt sitä", next:'exit'}, {text:"Tässä, löysin sen! (Anna Keppi)", reqItem: 'Biljardikeppi', itemConsume: 'Biljardikeppi', cost: -50, rel: 30, sanity: 20, next: 'found'}] }, found: {text:"LUOJA KIITOS! Ilmaiset juomat loppuelämäksi!", options:[{text:"Mahtavaa", next:'exit'}]} } }]
    },
    palma: {
      name: 'Pizzeria Palma',
      face: { bg: 'bg-red-500', text: 'text-white', accessory: <Pizza size={16}/>, mood: 'happy' },
      stages: [{ nodes: { root: { text: "Terve ystävä! Meillä uusi spesiaali. Käsikarvaton pizza. Se on... hygieeninen. Halvalla lähtee.", options: [{text:"Mä kokeilen (15€)", cost:15, rel: 10, sanity:5, next:'eat'}, {text:"Ei kiitos", next:'exit'}] }, eat: {text:"Olet rohkea soturi. Onnea vessareissuun.", options:[{text:"Kiitti", next:'exit'}]} } }]
    },
    library: {
      name: 'Nuolialan Kirjastonhoitaja',
      face: { bg: 'bg-cyan-600', text: 'text-white', accessory: <BookOpen size={16}/>, mood: 'deadpan' },
      stages: [{ nodes: { root: { text: "Anteeksi. Joku vaihtoi tietokone 3:n taustakuvaksi kuvan 'Luciano Pavarottista' ja pelasi Habbo Hotelia äänet täysillä.", options: [{text:"Se oli virus!", next:'exit'}, {text:"Maksan sakon (20€)", cost:20, rel: 5, sanity:5, next:'paid'}] }, paid: {text:"Selvä. Ole hiljempaa ensi kerralla.", options:[{text:"Ok", next:'exit'}]} } }]
    },
    rahi: {
      name: 'Rahi',
      face: { bg: 'bg-gray-800', text: 'text-gray-400', accessory: <Lock size={16}/>, mood: 'sneaky' },
      stages: [{ nodes: { root: { text: "Psst. Haluatko lämmintä limua? 50 senttiä tölkki.", options: [{text:"Otan kymmenen (5€)", cost:5, rel: 5, rewardItem:'Lämmin Limu', next:'sold'}, {text:"En", next:'exit'}] }, sold: {text:"Illo tehdä bisnestä.", options:[{text:"Moro", next:'exit'}]} } }]
    },
    internet: {
      name: 'Nettifirma',
      face: { bg: 'bg-blue-600', text: 'text-white', accessory: <Wifi size={16}/>, mood: 'neutral' },
      stages: [{ nodes: { root: { text: "Netin käyttösi on epäilyttävää. Päivitä 'Yksityisyys Plus' -pakettiin?", options: [{text:"Päivitä (50€)", cost:50, isSub:true, next:'done'}, {text:"Ei", next:'exit'}] }, done: {text:"Päivitetty.", options:[{text:"Moi", next:'exit'}]} } }]
    },
    spam: {
        name: 'Spam Botti 3000',
        face: { bg: 'bg-gray-500', text: 'text-green-400', accessory: <Bot size={16}/>, mood: 'neutral' },
        stages: [{
            nodes: {
                root: {
                    text: "TERVEHDYS IHMISOLENTO. AUTOSI TAKUU ON UMPEUTUNUT. PAINA 1 JATKAAKSESI 100 EUROLA. PAINA 2 TUHOUTUAKSESI.",
                    options: [
                        { text: "Jatka Takuuta (100€)", cost: 100, next: 'scammed' },
                        { text: "Itsetuho", next: 'explode' },
                        { text: "Luuri korvaan", next: 'exit' }
                    ]
                },
                scammed: { text: "KIITOS. SIIRRETÄÄN VAROJA... 'NIGERIAN PRINSSILLE'. HYVÄÄ PÄIVÄÄ.", options: [{ text: "Mitä?", next: 'exit' }] },
                explode: { text: "KÄYNNISTETÄÄN LASKENTA... 3... 2... 1... VITSI VITSI. OLEN NAUHOITE.", options: [{ text: "Huh", next: 'exit' }] }
            }
        }]
    }
  };

  const caller = CALLER_DB[callerId];
  
  if (caller) {
     let stageIndex = 0;
     if (history.count > 0 && isRecent && caller.stages.length > 1) stageIndex = 1;
     if (stageIndex >= caller.stages.length) stageIndex = caller.stages.length - 1;
     
     return {
       name: caller.name,
       face: caller.face,
       script: caller.stages[stageIndex].nodes
     };
  }

  return CALLER_DB.spam.stages[0].nodes; 
};

// --- SUB-COMPONENTS ---

const Avatar = ({ face, size = "md" }) => {
  const s = size === "lg" ? "w-24 h-24 text-4xl" : "w-12 h-12 text-lg";
  return (
    <div className={`${s} rounded-full ${face.bg} ${face.text} flex items-center justify-center border-2 border-white shadow-md relative shrink-0`}>
      {face.mood === 'happy' && <Smile size={size === 'lg' ? 40 : 20} />}
      {face.mood === 'serious' && <AlertTriangle size={size === 'lg' ? 40 : 20} />}
      {face.mood === 'angry' && <Zap size={size === 'lg' ? 40 : 20} />}
      {face.mood === 'neutral' && <Meh size={size === 'lg' ? 40 : 20} />}
      {face.mood === 'sweaty' && <Activity size={size === 'lg' ? 40 : 20} className="animate-pulse" />}
      {face.mood === 'cool' && <Glasses size={size === 'lg' ? 40 : 20} />}
      {face.mood === 'sad' && <Frown size={size === 'lg' ? 40 : 20} />}
      {face.mood === 'dizzy' && <RefreshCw size={size === 'lg' ? 40 : 20} className="animate-spin-slow" />}
      {face.mood === 'sneaky' && <Ghost size={size === 'lg' ? 40 : 20} />}
      {face.mood === 'deadpan' && <MoreHorizontal size={size === 'lg' ? 40 : 20} />}
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-100 text-slate-900">
        {face.accessory}
      </div>
    </div>
  );
};

const RelationshipBar = ({ score = 50 }) => {
    let color = 'bg-gray-400';
    let label = 'Neutraali';
    if (score > 80) { color = 'bg-pink-500'; label = 'Sydänystävä'; }
    else if (score > 60) { color = 'bg-green-500'; label = 'Kaveri'; }
    else if (score < 40) { color = 'bg-orange-500'; label = 'Ärsyyntynyt'; }
    else if (score < 20) { color = 'bg-red-600'; label = 'Vihollinen'; }

    return (
        <div className="flex flex-col gap-1 w-20">
            <div className="text-[8px] uppercase font-bold text-slate-400 text-right">{label}</div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export default function AbsurdServiceSim() {
  const [gameState, setGameState] = useState('select'); 
  const [player, setPlayer] = useState(null);
  
  // Stats
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(500);
  const [sanity, setSanity] = useState(100);
  
  // Board & World
  const [boardPos, setBoardPos] = useState(0);
  const [properties, setProperties] = useState(BOARD_MAP);
  const [callHistory, setCallHistory] = useState({}); 
  const [locationInteraction, setLocationInteraction] = useState(null); 
  const [canCallOut, setCanCallOut] = useState(true);
  const [lastCallerId, setLastCallerId] = useState(null);

  // Items & Deals
  const [inventory, setInventory] = useState([]); 
  const [contracts, setContracts] = useState([]); 
  const [logs, setLogs] = useState([]);

  // Loop State
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [vibe, setVibe] = useState('NEUTRAALI');
  const [phoneState, setPhoneState] = useState({ mode: 'home', caller: null, status: 'idle', currentNodeId: 'root' });

  // Flavor Text Queue
  const [smsNotification, setSmsNotification] = useState(null);

  // Initialize relationships
  useEffect(() => {
      const initialHistory = {};
      ['vittuamma', 'reijo', 'hagert', 'kreetta', 'taisto', 'paananen', 'manu', 'milla', 'palma', 'rahi'].forEach(id => {
          initialHistory[id] = { count: 0, lastDay: -100, affinity: 50 };
      });
      setCallHistory(initialHistory);
  }, []);

  const addLog = (msg) => {
      setLogs(prev => [msg, ...prev]);
  };

  const selectCharacter = (char) => {
    setPlayer(char);
    let startCash = char.bonus.cash || 500;
    let startItems = char.bonus.item ? [char.bonus.item] : [];
    setCash(startCash);
    setInventory(startItems);
    setProperties([...BOARD_MAP]); 
    setGameState('playing');
    setLogs([`Päivä 1: ${char.name} muuttaa Louksuun.`]);
  };

  const showRandomSMS = () => {
      const messages = [
          { sender: 'Taisto', text: "TARJOUS: Pilaantunutta maitoa -50%." },
          { sender: 'Vittuämmä', text: "Kuka siirsi mun puutarhatonttua???" },
          { sender: 'Tuntematon', text: "Me tiedetään mitä teit." },
          { sender: 'Kreetta', text: "Täällä on niin yksinäistä..." },
          { sender: 'Paananen', text: "loasdkjasd... sori taskupuhelu" },
          { sender: 'Manu', text: "Joku jätti purkan penkille. Etsin syyllistä." }
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setSmsNotification(msg);
      setTimeout(() => setSmsNotification(null), 4000);
  };

  const spinWheel = () => {
    if (spinning || phoneState.caller || locationInteraction || cash < -1000) return;

    setSpinning(true);
    setPhoneState(prev => ({ ...prev, mode: 'home' }));

    // 1. Roll Board Movement
    let roll = Math.ceil(Math.random() * 6);
    if (player.bonus.luck && Math.random() > 0.5) roll += 1; 
    
    let newPos = (boardPos + roll) % BOARD_MAP.length;
    setBoardPos(newPos);

    // 2. Spin Wheel Animation
    // LABELS: NAAPURI, KAUPPA, HUIJAUS, TAPAHTUMA
    const vibes = ['NAAPURI', 'KAUPPA', 'HUIJAUS', 'TAPAHTUMA', 'NAAPURI', 'KAUPPA', 'HUIJAUS', 'TAPAHTUMA'];
    const targetIndex = Math.floor(Math.random() * 8);
    const chosenVibe = vibes[targetIndex];
    
    const segmentAngle = 360 / 8;
    const targetRotation = rotation + (360 * 5) + (360 - (targetIndex * segmentAngle) - (rotation % 360));
    setRotation(targetRotation);

    // Random flavor text during spin
    if (Math.random() > 0.7) setTimeout(showRandomSMS, 1500);

    // 3. Resolve Movement & Interaction
    setTimeout(() => {
        setSpinning(false);
        setVibe(chosenVibe);
        setCanCallOut(true); // Reset daily call capability
        resolveBoardLand(newPos, chosenVibe);
        setDay(d => d + 1);
        
        // Income / Bills
        let income = 0;
        if (player.bonus.merchant) income += 30; // Ville gets 30
        if (player.bonus.share) income += 60; // Lauri gets 60 (Increased from 20)
        properties.forEach(p => { if (p.owner === 'player') income += p.income; });
        if (income > 0) { setCash(c => c + income); addLog(`Tulot: +${income}€`); }
        
        let bills = contracts.reduce((acc, c) => acc + c.cost, 0);
        if (bills > 0) { setCash(c => c - bills); addLog(`Laskut: -${bills}€`); }

    }, 3000);
  };

  const resolveBoardLand = (pos, nextVibe) => {
    const tile = properties[pos];
    addLog(`Saavuit paikkaan: ${tile.label}.`);

    if (tile.actions) {
      setLocationInteraction({ ...tile, nextVibe }); 
    } else {
      if (tile.effect === 'tax') { setCash(c => c - 100); addLog("Veroja 100€."); }
      else if (tile.effect === 'scam') { setCash(c => c - 20); addLog("Hävisit 20€."); }
      else if (tile.effect === 'jail') { setSanity(s => s - 10); addLog("Poliisikuulustelu."); }
      else if (tile.effect === 'chance') {
          const roll = Math.random();
          if (roll > 0.6) { setInventory(prev => [...prev, 'Roska']); addLog("Löysit Roskan."); }
          else { setSanity(s => s - 5); addLog("Kompastuit."); }
      }
      
      triggerCall(nextVibe);
    }
  };

  const handleLocationAction = (action) => {
    if (action.type === 'buy' && cash < action.cost) {
      addLog("Ei tarpeeksi rahaa!");
      return;
    }
    
    if (action.cost > 0) setCash(c => c - action.cost);

    let success = true;
    let msg = action.text || "Tehtävä suoritettu.";

    if (action.type === 'steal') {
      const roll = Math.random();
      let chance = action.risk;
      if (player.bonus.luck) chance += 0.1;

      if (roll < chance) {
        success = false;
        msg = "KIINNI JÄIT! Sakot 50€.";
        setCash(c => c - 50);
        setSanity(s => s - 10);
      } else {
        msg = "Onnistuit! Pöllit sen.";
        setSanity(s => s + 5);
      }
    } else if (action.type === 'search') {
      const roll = Math.random();
      if (roll < action.risk) { 
         success = true;
         msg = "Löysit sen!";
      } else {
         success = false;
         msg = "Et löytänyt mitään.";
      }
    }

    if (success && action.item) {
      setInventory(prev => [...prev, action.item]);
      addLog(`+ ESINE: ${action.item}`);
    }
    
    if (action.sanity) setSanity(s => Math.min(100, s + action.sanity));

    addLog(msg);
    
    const nextVibe = locationInteraction.nextVibe;
    setLocationInteraction(null);
    triggerCall(nextVibe);
  };

  const leaveLocation = () => {
    addLog("Poistutaan...");
    const nextVibe = locationInteraction.nextVibe;
    setLocationInteraction(null);
    triggerCall(nextVibe);
  };

  const triggerCall = (vibe) => {
      let pool = [];
      if (vibe === 'NAAPURI') pool = ['vittuamma', 'paananen', 'manu'];
      else if (vibe === 'KAUPPA') pool = ['reijo', 'kreetta', 'palma', 'milla', 'library'];
      else if (vibe === 'HUIJAUS') pool = ['hagert', 'taisto', 'spam'];
      else pool = ['vittuamma', 'paananen', 'reijo', 'kreetta', 'spam']; 

      // ANTI-REPETITION LOGIC
      let validPool = pool.filter(id => id !== lastCallerId);
      if (validPool.length === 0) validPool = pool; 

      const callerId = validPool[Math.floor(Math.random() * validPool.length)];
      setLastCallerId(callerId);
      initiateCall(callerId);
  };
  
  const initiateCall = (callerId) => {
      const history = callHistory[callerId] || { count: 0, lastDay: -100, affinity: 50 };
      const callerData = getCallerDialogue(callerId, history, day);

      setPhoneState({
          mode: 'call',
          caller: { ...callerData, id: callerId },
          status: 'ringing',
          currentNodeId: 'root'
      });
      setTimeout(() => {
          setPhoneState(prev => ({ ...prev, status: 'connected' }));
      }, 1500);
  };

  const handlePhoneResponse = (opt) => {
      const callerId = phoneState.caller.id;
      
      // Calculate Relationship Change
      let relChange = opt.rel || 0;
      if (opt.cost > 0) relChange += 5; 

      setCallHistory(prev => {
          const current = prev[callerId] || { count: 0, lastDay: 0, affinity: 50 };
          return {
            ...prev,
            [callerId]: {
                count: current.count + 1,
                lastDay: day,
                affinity: Math.min(100, Math.max(0, current.affinity + relChange))
            }
          };
      });

      if (opt.cost) {
          if (opt.cost < 0) setCash(c => c - opt.cost); 
          else setCash(c => c - opt.cost);
      }

      if (opt.isSub) setContracts(prev => [...prev, { name: phoneState.caller.name, cost: opt.cost }]);
      
      setSanity(s => Math.min(100, Math.max(0, s + (opt.sanity || 0))));

      if (opt.rewardItem) {
          if (opt.rewardItem === 'random') {
             const i = ['Ämpäri', 'Liima', 'Rautalanka'][Math.floor(Math.random()*3)];
             setInventory(prev => [...prev, i]);
             addLog(`+ ESINE: ${i}`);
          } else {
             setInventory(prev => [...prev, opt.rewardItem]);
             addLog(`+ ESINE: ${opt.rewardItem}`);
          }
      }

      if (opt.itemConsume) {
          const idx = inventory.indexOf(opt.itemConsume);
          if (idx > -1) {
              const newInv = [...inventory];
              newInv.splice(idx, 1);
              setInventory(newInv);
              addLog(`- ESINE: ${opt.itemConsume}`);
          }
      }

      // Check Next Step
      if (opt.next === 'exit') {
          setPhoneState(prev => ({ ...prev, status: 'ending' }));
          setTimeout(() => {
              setPhoneState({ mode: 'home', caller: null, status: 'idle', currentNodeId: 'root' });
          }, 1500);
      } else {
          // Advance Dialogue
          setPhoneState(prev => ({ ...prev, currentNodeId: opt.next }));
      }
  };

  // --- RENDER ---

  if (gameState === 'select') {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
              <div className="max-w-5xl w-full">
                  <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-2 tracking-tighter">LOUKSU SIMULAATTORI</h1>
                  <p className="text-slate-400 text-center mb-10">Valitse pelaaja.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {CHARACTERS.map(c => (
                          <button key={c.id} onClick={() => selectCharacter(c)} className="bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl text-left border border-slate-700 hover:border-indigo-500 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">{c.name[0]}</div>
                                  <div className="bg-slate-900 text-slate-400 px-2 py-1 rounded text-xs uppercase font-mono">{c.perk}</div>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-1">{c.name}</h3>
                              <p className="text-sm text-slate-400">{c.desc}</p>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  if (cash < -1000 || sanity <= 0) {
     return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
            <Skull size={80} className="text-red-600 mb-6 animate-pulse" />
            <h1 className="text-6xl font-black mb-4">PERKELE.</h1>
            <p className="text-2xl text-slate-400 mb-8">{sanity <= 0 ? "Menetit järkesi." : "Olet vararikossa."}</p>
            <div className="text-slate-500 mb-12">Selvisit {day} Päivää</div>
            <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">YBITÄ UUDESTAAN</button>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-xl font-black transform -rotate-2 shadow-lg text-xl border-4 border-indigo-500">
               {player?.name[0]}
             </div>
             <div className="leading-tight">
                 <div className="font-black uppercase tracking-wide text-lg text-slate-800">{player?.name}</div>
                 <div className="text-xs text-slate-500 font-bold flex gap-2">
                   <span>Päivä {day}</span>
                   <span className="text-indigo-400">•</span>
                   <span>{vibe}</span>
                 </div>
             </div>
        </div>
        <div className="flex gap-6 pr-4">
            <div className="text-right">
                <div className={`text-2xl font-black ${cash < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{cash}€</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rahat</div>
            </div>
            <div className="text-right">
                <div className={`text-2xl font-black ${sanity < 30 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>{sanity}%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Järki</div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start relative">
         <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: TOWN MAP */}
            <div className="lg:col-span-7 flex flex-col gap-6 relative">
                
                {locationInteraction && (
                  <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-indigo-100 shadow-2xl flex flex-col p-8 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className={`p-4 rounded-2xl ${locationInteraction.color} text-slate-800 shadow-md`}>
                          {locationInteraction.icon || <MapPin size={32} />}
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-slate-800">{locationInteraction.label}</h2>
                           <p className="text-slate-500 font-medium">Mitä haluat tehdä?</p>
                        </div>
                      </div>
                      <button onClick={leaveLocation} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto content-start">
                      {locationInteraction.actions.map((action, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleLocationAction(action)}
                          className={`p-4 rounded-xl text-left border-2 transition-all hover:scale-[1.02] flex flex-col gap-1 relative overflow-hidden group ${
                            action.type === 'steal' ? 'bg-slate-50 border-slate-200 hover:border-red-400' : 
                            action.type === 'buy' ? 'bg-indigo-50 border-indigo-100 hover:border-indigo-400' :
                            'bg-white border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full relative z-10">
                            <span className="font-bold text-slate-800 flex items-center gap-2">{action.icon}{action.label}</span>
                            {action.cost > 0 && <span className="text-xs bg-white px-2 py-1 rounded-full font-mono border border-slate-100 shadow-sm">{action.cost}€</span>}
                          </div>
                          <p className="text-xs text-slate-500 relative z-10">{action.text}</p>
                          {action.type === 'steal' && <span className="absolute bottom-2 right-2 text-[10px] text-red-400 uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity">RISKI {(action.risk * 100)}%</span>}
                        </button>
                      ))}
                      <button onClick={leaveLocation} className="p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 font-bold flex items-center justify-center gap-2">
                        <Footprints size={16}/> Poistu
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-64 overflow-y-auto flex flex-col">
                     {logs.map((l, i) => (
                         <div key={i} className={`text-xs font-mono mb-1 ${i===0 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                             {i===0 && '> '}{l}
                         </div>
                     ))}
                </div>

                <div className={`bg-white/50 rounded-3xl p-4 border border-white shadow-inner flex justify-center transition-opacity duration-300 ${locationInteraction ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                    <div className="relative flex flex-col items-center justify-center py-4">
                      <div className="absolute top-0 z-20 text-indigo-600 translate-y-2 filter drop-shadow-lg">
                        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-t-[25px] border-t-indigo-600 border-r-[15px] border-r-transparent"></div>
                      </div>
                      <div 
                        className="w-64 h-64 rounded-full border-8 border-slate-800 relative overflow-hidden shadow-2xl transition-transform duration-[3000ms] cubic-bezier(0.1, 0, 0.2, 1) bg-slate-100"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                        {['NAAPURI', 'KAUPPA', 'HUIJAUS', 'TAPAHTUMA', 'NAAPURI', 'KAUPPA', 'HUIJAUS', 'TAPAHTUMA'].map((label, i) => (
                          <div key={i} className="absolute w-full h-full flex justify-center pt-2 left-0 top-0" style={{ transform: `rotate(${i * 45}deg)` }}>
                            <div className="w-[1px] h-1/2 bg-slate-300 absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"></div>
                            <span className={`text-[10px] font-black tracking-widest mt-1 ${
                              label === 'NAAPURI' ? 'text-blue-500' : 
                              label === 'HUIJAUS' ? 'text-red-500' :
                              label === 'KAUPPA' ? 'text-purple-500' : 'text-green-500'
                            }`}>{label}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={spinWheel} 
                        disabled={spinning || phoneState.caller !== null || locationInteraction}
                        className={`mt-6 px-8 py-3 rounded-full text-xl font-bold shadow-xl transition-all ${
                          spinning || phoneState.caller || locationInteraction
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 active:scale-95'
                        }`}
                      >
                        {spinning ? 'PYÖRII...' : locationInteraction ? 'VARATTU' : phoneState.caller ? 'PUHELIN!' : 'SEURAAVA PÄIVÄ'}
                      </button>
                    </div>
                </div>

                <div className={`bg-white rounded-xl p-4 shadow-xl border-t-4 border-slate-800 relative transition-opacity duration-300 ${locationInteraction ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex gap-2 overflow-x-hidden relative h-24 items-center px-10">
                        <div className="flex gap-2 transition-transform duration-500" style={{ transform: `translateX(calc(50% - ${(boardPos * 72) + 36}px))` }}>
                            {properties.map((t, i) => (
                                <div key={i} className={`w-16 h-16 flex-shrink-0 rounded-lg ${t.color} border-2 ${i === boardPos ? 'border-indigo-600 scale-125 shadow-xl z-10' : 'border-transparent opacity-60'} flex flex-col items-center justify-center relative transition-all`}>
                                    <div className="text-slate-700">{t.icon || <MapPin size={16}/>}</div>
                                    <div className="text-[8px] font-bold text-center leading-none mt-1 px-1 truncate w-full">{t.label}</div>
                                    {i === boardPos && <div className="absolute -top-4 text-indigo-600 animate-bounce"><User size={24} fill="currentColor" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: SMARTPHONE UI */}
            <div className="lg:col-span-5 flex justify-center">
                <div className="w-[350px] h-[700px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl ring-4 ring-slate-900/10 relative transform transition-transform duration-500">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-40 bg-slate-900 rounded-b-2xl z-20 flex justify-center items-end gap-3 pb-1">
                        <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                        <div className="w-2 h-2 bg-indigo-900 rounded-full"></div>
                    </div>

                    <div className="w-full h-full bg-slate-100 rounded-[2.5rem] overflow-hidden relative flex flex-col">
                        
                        {/* Status Bar */}
                        <div className="h-12 px-6 flex justify-between items-center text-[10px] font-bold text-slate-800 pt-4 z-10">
                            <span>14:00</span>
                            <div className="flex gap-1">
                                <Wifi size={12} />
                                <div className="w-5 h-2.5 border border-slate-800 rounded-sm bg-slate-800"></div>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 relative overflow-hidden">

                            {/* SMS NOTIFICATION OVERLAY */}
                            {smsNotification && (
                                <div className="absolute top-4 left-4 right-4 z-50 bg-slate-800/95 backdrop-blur rounded-2xl p-3 shadow-xl animate-in slide-in-from-top-4 duration-300 border border-slate-700">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white"><MessageSquare size={16}/></div>
                                        <div>
                                            <div className="font-bold text-xs text-white uppercase">{smsNotification.sender}</div>
                                            <div className="text-xs text-slate-300">{smsNotification.text}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* HOME */}
                            {phoneState.mode === 'home' && (
                                <div className="p-6 h-full flex flex-col">
                                    <div className="mt-8 mb-8">
                                        <div className="text-5xl font-thin text-slate-800">14:00</div>
                                        <div className="text-sm text-slate-500 font-medium mt-1">Keskiviikko, {day}. Lokakuuta</div>
                                    </div>

                                    <div className="space-y-3">
                                        {phoneState.caller && (
                                            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-indigo-100 animate-bounce-subtle cursor-pointer" onClick={() => setPhoneState(p => ({...p, status: 'connected'}))}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white"><Phone size={20}/></div>
                                                    <div>
                                                        <div className="font-bold text-sm">Saapuva Puhelu</div>
                                                        <div className="text-xs text-slate-500">{phoneState.caller.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {locationInteraction && (
                                           <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center gap-3 animate-pulse">
                                               <div className="bg-orange-100 p-2 rounded-full text-orange-600"><ShoppingBag size={16}/></div>
                                               <div>
                                                   <div className="font-bold text-xs text-orange-800">Paikan päällä</div>
                                                   <div className="text-[10px] text-orange-600">Suorita tehtävä kartalla</div>
                                               </div>
                                           </div>
                                        )}
                                    </div>

                                    {/* App Icons */}
                                    <div className="mt-auto grid grid-cols-4 gap-4 mb-8">
                                        <button onClick={() => setPhoneState(prev => ({...prev, mode: 'call_menu'}))} className="aspect-square bg-green-500 rounded-2xl shadow-md flex items-center justify-center text-white hover:scale-105 transition-transform"><Phone size={24}/></button>
                                        <button onClick={() => setPhoneState(prev => ({...prev, mode: 'wallet'}))} className="aspect-square bg-blue-500 rounded-2xl shadow-md flex items-center justify-center text-white hover:scale-105 transition-transform"><Wallet size={24}/></button>
                                        <button onClick={() => setPhoneState(prev => ({...prev, mode: 'inventory'}))} className="aspect-square bg-orange-500 rounded-2xl shadow-md flex items-center justify-center text-white hover:scale-105 transition-transform"><Grid size={24}/></button>
                                        <button onClick={() => setPhoneState(prev => ({...prev, mode: 'contacts'}))} className="aspect-square bg-indigo-500 rounded-2xl shadow-md flex items-center justify-center text-white hover:scale-105 transition-transform"><Users size={24}/></button>
                                    </div>
                                </div>
                            )}

                            {/* WALLET APP */}
                            {phoneState.mode === 'wallet' && (
                                <div className="h-full bg-slate-50 p-6 flex flex-col">
                                    <h2 className="text-2xl font-bold mb-4">Lompakko</h2>
                                    <div className="space-y-2 overflow-y-auto">
                                        {contracts.map((c, i) => (
                                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex justify-between">
                                                <span>{c.name}</span>
                                                <span className="text-red-500">-{c.cost}€</span>
                                            </div>
                                        ))}
                                        {contracts.length === 0 && <p className="text-slate-400">Ei juoksevia kuluja.</p>}
                                    </div>
                                    <button onClick={() => setPhoneState(prev => ({...prev, mode: 'home'}))} className="mt-auto bg-slate-200 py-3 rounded-xl font-bold text-slate-600">Takaisin</button>
                                </div>
                            )}

                             {/* INVENTORY APP */}
                             {phoneState.mode === 'inventory' && (
                                <div className="h-full bg-slate-50 p-6 flex flex-col">
                                    <h2 className="text-2xl font-bold mb-4">Reppu</h2>
                                    <div className="grid grid-cols-3 gap-2 overflow-y-auto">
                                        {inventory.map((item, i) => (
                                            <div key={i} className="aspect-square bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-xs text-center p-1 border border-slate-200">
                                                <Gift size={16} className="mb-1 text-slate-400"/>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setPhoneState(prev => ({...prev, mode: 'home'}))} className="mt-auto bg-slate-200 py-3 rounded-xl font-bold text-slate-600">Takaisin</button>
                                </div>
                            )}

                            {/* CONTACTS APP */}
                            {phoneState.mode === 'contacts' && (
                                <div className="h-full bg-slate-50 p-6 flex flex-col">
                                    <h2 className="text-2xl font-bold mb-2">Yhteystiedot</h2>
                                    <p className="text-xs text-slate-400 mb-4">{canCallOut ? 'Voit soittaa 1 puhelun' : 'Ei puheluita tänään'}</p>
                                    <div className="space-y-2 overflow-y-auto flex-1">
                                        {Object.keys(callHistory).map((id) => (
                                            <button 
                                                key={id} 
                                                disabled={!canCallOut}
                                                onClick={() => {
                                                    if (canCallOut) {
                                                        setCanCallOut(false);
                                                        initiateCall(id);
                                                    }
                                                }}
                                                className="w-full bg-white p-4 rounded-xl shadow-sm text-left font-bold text-slate-700 disabled:opacity-50 flex justify-between items-center"
                                            >
                                                <span>{id.charAt(0).toUpperCase() + id.slice(1)}</span>
                                                <RelationshipBar score={callHistory[id].affinity} />
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setPhoneState(prev => ({...prev, mode: 'home'}))} className="mt-4 bg-slate-200 py-3 rounded-xl font-bold text-slate-600">Takaisin</button>
                                </div>
                            )}

                            {/* CALL SCREEN */}
                            {phoneState.mode === 'call' && phoneState.caller && (
                                <div className="absolute inset-0 bg-slate-800 text-white flex flex-col z-20">
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="mb-6 scale-125 transform transition-transform duration-700 hover:scale-150">
                                            <Avatar face={phoneState.caller.face} size="lg" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-1">{phoneState.caller.name}</h2>
                                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-6">
                                            {phoneState.status === 'ringing' ? 'Yhdistetään...' : phoneState.status === 'ending' ? 'Puhelu Päättyi' : '00:05'}
                                        </div>
                                        
                                        {phoneState.status === 'connected' && (
                                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-sm leading-relaxed mb-4 animate-in slide-in-from-bottom-4">
                                                {phoneState.caller.script[phoneState.currentNodeId]?.text || "..."}
                                            </div>
                                        )}
                                    </div>

                                    {phoneState.status === 'connected' && (
                                        <div className="bg-slate-900 p-4 rounded-t-3xl space-y-2 animate-in slide-in-from-bottom-full duration-500">
                                            {phoneState.caller.script[phoneState.currentNodeId]?.options.map((opt, i) => {
                                                const hasItem = !opt.reqItem || inventory.includes(opt.reqItem);
                                                const hasOwner = !opt.reqOwner || properties.find(p => p.id === opt.reqOwner)?.owner === 'player';
                                                
                                                // Fixed Perk Logic: Check if player has the specific bonus flag
                                                // e.g. req: 'charm' checks player.bonus.charm
                                                const hasPerk = !opt.req || (player.bonus && player.bonus[opt.req]);
                                                
                                                if (!hasItem || !hasOwner || !hasPerk) return null;

                                                return (
                                                    <button 
                                                        key={i}
                                                        onClick={() => handlePhoneResponse(opt)}
                                                        className={`w-full text-left p-3 rounded-xl border flex justify-between items-center group transition-colors ${
                                                            opt.req 
                                                              ? 'bg-amber-900/40 border-amber-500/50 hover:bg-amber-900/60' 
                                                              : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        <span className={`text-sm font-medium ${opt.req ? 'text-amber-400 font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                                                            {opt.req && "★ "} {opt.text}
                                                        </span>
                                                        {opt.cost > 0 && <span className="text-xs text-red-400 font-mono">-{opt.cost}€</span>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                        <div className="h-1 w-1/3 bg-slate-300 mx-auto rounded-full mb-2 shrink-0"></div>
                    </div>
                </div>
            </div>

         </div>
      </div>
    </div>
  );
}