// Shared option lists and badge styles.

// Global constants & styling dictionaries
const STATUS_OPTIONS = ["Raw", "At Grading", "Graded", "Listed", "Sold"];
const GRADE_OPTIONS = ["PSA 9", "PSA 10", "SGC 9", "SGC 10", "BGS 9", "BGS 9.5", "BGS 10"];
const GRADING_SERVICE_OPTIONS = [
  "PSA via Australia", 
  "PSA via ShipMyCards", 
  "SGC via Australia", 
  "Bought Graded", 
  "None"
];
const SPORT_OPTIONS = ["NFL", "NBA", "WNBA", "MLB", "AFL", "Soccer", "MMA", "WWE", "Pokémon", "Other"];

const SELL_DECISION_STYLE = {
  "Sell Raw First": { color: "#C9A227", label: "Sell Raw First" },
  "Grade First": { color: "#8B6FD6", label: "Grade First" },
  "Sell PSA 10": { color: "#4E8BC9", label: "Sell PSA 10" },
  "Sell PSA 9": { color: "#4E8BC9", label: "Sell PSA 9" },
  Hold: { color: "#5C7A99", label: "Hold" },
  Listed: { color: "#2FA89A", label: "Listed" },
  Sold: { color: "#4E8B6B", label: "Sold" },
  "": { color: "#4A4F5C", label: "—" },
};

// Team rosters for Box Breaks — pre-filled so you're not typing 32 team names every time.
// Editable per spot in case of trades/relocations/name changes.
const LEAGUE_TEAMS = {
  NFL: ["Cardinals", "Falcons", "Ravens", "Bills", "Panthers", "Bears", "Bengals", "Browns", "Cowboys", "Broncos", "Lions", "Packers", "Texans", "Colts", "Jaguars", "Chiefs", "Raiders", "Chargers", "Rams", "Dolphins", "Vikings", "Patriots", "Saints", "Giants", "Jets", "Eagles", "Steelers", "49ers", "Seahawks", "Buccaneers", "Titans", "Commanders"],
  NBA: ["Hawks", "Celtics", "Nets", "Hornets", "Bulls", "Cavaliers", "Mavericks", "Nuggets", "Pistons", "Warriors", "Rockets", "Pacers", "Clippers", "Lakers", "Grizzlies", "Heat", "Bucks", "Timberwolves", "Pelicans", "Knicks", "Thunder", "Magic", "76ers", "Suns", "Trail Blazers", "Kings", "Spurs", "Raptors", "Jazz", "Wizards"],
  MLB: ["Diamondbacks", "Braves", "Orioles", "Red Sox", "Cubs", "White Sox", "Reds", "Guardians", "Rockies", "Tigers", "Astros", "Royals", "Angels", "Dodgers", "Marlins", "Brewers", "Twins", "Mets", "Yankees", "Athletics", "Phillies", "Pirates", "Padres", "Giants", "Mariners", "Cardinals", "Rays", "Rangers", "Blue Jays", "Nationals"],
  WNBA: ["Dream", "Sky", "Sun", "Wings", "Fever", "Aces", "Sparks", "Mercury", "Storm", "Mystics", "Liberty", "Lynx", "Valkyries"],
  AFL: ["Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon", "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn", "Melbourne", "North Melbourne", "Port Adelaide", "Richmond", "St Kilda", "Sydney", "West Coast", "Western Bulldogs"],
};
const BOX_LEAGUE_OPTIONS = ["NFL", "NBA", "MLB", "WNBA", "AFL", "Custom"];

const LOCATION_OPTIONS = ["In Hand", "ShipMyCards Vault", "eBay Vault", "At Grading", "In Transit"];
const LOCATION_STYLE = {
  "In Hand": { color: "#4E8B6B" },
  "ShipMyCards Vault": { color: "#C9A227" },
  "eBay Vault": { color: "#C9A227" },
  "At Grading": { color: "#8B6FD6" },
  "In Transit": { color: "#5C7A99" },
};
