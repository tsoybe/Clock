var s = require("Storage");
var apps = s.list(/\.info$/).map(
  app => {
    var a=s.readJSON(app,1);
    return a && {
      name:a.name,
      type:a.type,
      icon:a.icon,
      sortorder:a.sortorder,
      src:a.src
    };})
  .filter(
    app=>app && (
      app.type=="app" ||
      !app.type
    ) && (
      app.name.startsWith("Tsoy") &&
      app.name != "Tsoy Launcher"
    )
);

apps.sort((a,b) => {
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});

const menu = {
  "< Back": () => load()
};

apps.reduce((menu, app) => {
  menu[app.name.substring(5)] = () => load(app.src);
  return menu;
}, menu);

E.showMenu(menu);