var locale = require("locale");

var flagLine = 0; //0-7: Zeile
var flagTime = false;
var Buffer = Array(8).fill("");
var lastMin = -1;

function a2B(Buffer, Text) {
  let ll = 13;
  let Pre = "";
  let Sep = " ";
  if (Array.isArray(Text)) {
    let i = Buffer.length;
    for (let Part of Text) {
      if (!Buffer[i]) {
        Buffer[i] = Pre + Part;
      } else if (Buffer[i].length + Part.length + Sep.length > ll) {
        i++;
        Buffer[i] = Pre + Part;
      } else {
        Buffer[i] += Sep + Part;
      }
    }
  } else {
    Buffer.push(Pre + Text);
  }
}

function Time2Text(now) {
  const MinArray = ["", "fünf nach", "zehn nach", "viertel nach", "zwanzig nach", "fünf vor halb", "halb", "fünf nach halb", "zwanzig vor", "viertel vor", "zehn vor", "fünf vor"];
  const MinNextIndex = 5;
  const HourArray = ["zwölf", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf"];
  const ToMinArray = ["", "bisschen nach", "bald", "gleich", "fast"];
  const ToNextMinIndex = 2;

  let H = now.getHours();
  let M = now.getMinutes();

  let T25 = M % 5; // Minuten bis zum n�chsten 5min-Step
  M -= T25;
  let Iof5 = M / 5; // Index des 5min-Steps.

  if (T25 >= ToNextMinIndex) Iof5++;
  if (Iof5 >= MinNextIndex) H++;

  let ret = [ToMinArray[T25], MinArray[Iof5], HourArray[H % 12]].join(" ").trim();
  return ret[0].toUpperCase()+ret.slice(1);
}

function Update(force) {
  if (!Bangle.isLCDOn()) return;
  try {
    PrepareDisplay();
    g.setColor(0, 1, 0);
    let now = new Date();
    if (force) {
      flagTime=false;
      UpdateTime(now, true);
    } else if(now.getMinutes()!=lastMin) {
      lastMin=now.getMinutes();
      UpdateTime(now, false);
    }
    WriteDisplayLine(flagLine,">"+(flagTime?locale.time(now):"")+((now.getSeconds()%2)?"":"_"));
  }
  catch(ex) {
    if (tick) clearInterval(tick);
    throw ex;
  }
}

function UpdateTime(now, all) {
  let B=[];
  a2B(B, locale.dow(now));
  a2B(B, now.getDate() + ". " + locale.month(now));
  a2B(B, "");
  a2B(B, Time2Text(now).split(" "));
  flagLine=B.length;
  for (let i = B.length; i < 8; i++ ) {
    B.push("");
  }
  for (let i = 0; i < Buffer.length; i++) {
    WriteDisplayLine(i, B[i], all);
  }
}

function WriteDisplayLine(i, LineText, force) {
  const mt = 30;
  const ml = 0;
  const lh = 26;
  if (LineText != Buffer[i] || force) {
    if (LineText != undefined) Buffer[i]=LineText;
    g.clearRect(0, mt + i * lh, 239, mt + (i+1) * lh -1);
    g.drawString(Buffer[i], ml, mt + i * lh);
  }
}

function PrepareDisplay() {
  // Das Display hat 240x240 Pixel,
  // 24px sind f�r Widgets
  g.setFont("6x8", 3); // -> Zeichengr��e 18x24
  g.setFontAlign(-1, -1); //Ausrichtung Links oben
  g.setColor(0, 1, 0);
}

function cbBtn1() {
  load("tsoy_launcher.app.js");
}

function cbBtn4() {
  flagTime=!flagTime;
  Update();
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
Update(true);

Bangle.on('lcdPower',function(on) {
  //Wird ben�tigt, da Update bei off nix macht
  if (on)
    Update(true);
});
var tick = setInterval(Update, 1000);
setWatch(cbBtn1, BTN1, {repeat:true ,edge:"falling"});
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
setWatch(cbBtn4, BTN4, {repeat: true, edge:"falling"});
setWatch(()=>Bangle.setLCDPower(false), BTN5, {repeat: true, edge:"falling"});