const ServicesID = "fd6f";

function cbDevices(devices) {
  let c0 = devices.reduce((accu, cur) => accu + cur.services.includes("fd6f"), 0);

  let c1 = devices.length;
  E.showPrompt(c0+" gefunden\n"+c1+" gesamt", {
    buttons : {
      "ReScan": true,
      "Exit":   false
    }
  }).then(function(v) {
  if (v) {
    Scan();
  } else {
    load();
  }
});
}

function Scan() {
  E.showMessage("Suche...");
  NRF.findDevices(cbDevices);
}

Scan();
