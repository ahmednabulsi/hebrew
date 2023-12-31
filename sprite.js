/*!
 *  Howler.js Audio Sprite Demo
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

// Cache references to DOM elements.


/**
 * Sprite class containing the state of our sprites to play and their progress.
 * @param {Object} options Settings to pass into and setup the sound and visuals.
 */
var Sprite = function(options) {
  var self = this;

  self.sounds = [];

  // Setup the options to define this sprite display.
  self._width = options?.width || [];
  self._left = options?.left || [];
  self._spriteMap = options.spriteMap;
  self._sprite = options.sprite;
  self._currentPlayingEl = undefined;

  // Create our audio sprite definition.
  self.sound = new Howl({
    src: options.src,
    sprite: options.sprite
  });
  self.setupListeners();

  // Setup a resize event and fire it to setup our sprite overlays.
  window.addEventListener('resize', function() {
    self.resize();
  }, false);
  self.resize();

  // Begin the progress step tick.
  requestAnimationFrame(self.step.bind(self));
};
Sprite.prototype = {
  /**
   * Setup the listeners for each sprite click area.
   */
  setupListeners: function() {
    var self = this;
    var keys = Object.keys(self._spriteMap);

    keys.forEach(function(key) {
      
      document.getElementById(key.replace(/ /g,'-'))?.addEventListener('click', function(e) {
        self.play(key);
        self._currentPlayingEl = e.target;
      }, false);
    });

    self.sound.on('end', function(event) {
      var customEvent = new Event('spritePlayEnded', {
        bubbles: true,
        detail: self._currentPlayingEl
      });
      self._currentPlayingEl.dispatchEvent(customEvent);
    });
  },

  /**
   * Play a sprite when clicked and track the progress.
   * @param  {String} key Key in the sprite map object.
   */
  play: function(key) {
    var self = this;
    var sprite = self._spriteMap[key];

    // Play the sprite sound and capture the ID.
    var id = self.sound.play(sprite);
    return id;
    // Create a progress element and begin visually tracking it.
    // var elm = document.createElement('div');
    // elm.className = 'progress';
    // elm.id = id;
    // elm.dataset.sprite = sprite;
    // window[key].appendChild(elm);
    // self.sounds.push(elm);

    // When this sound is finished, remove the progress element.
    // self.sound.once('end', function() {
      
    //   var index = self.sounds.indexOf(elm);
    //   if (index >= 0) {
    //     self.sounds.splice(index, 1);
    //     window[key].removeChild(elm);
    //   }
    // }, id);
  },
  playSelected: function() {
    document.addEventListener('spritePlayEnded', function(event) {
      console.log('Custom event triggered with data:', event);
    });
  },
  playAll: function(index = 0, delay, repeat, repeated = 0) {
    var self = this;
    return new Promise((resolve) => {
      var resolePrmoise = false;
      if (repeat && repeated + 1 >= repeat && index + 1 >= Object.keys(self._spriteMap).length) { 
        // resolve('Done');
        console.log('done repeat');
        resolePrmoise = true;
      } else if (!repeat && index + 1 >= Object.keys(self._spriteMap).length) {
        // resolve('Done');
        console.log('done index');
        resolePrmoise = true;
      }
      document.querySelector('.playing-sprite')?.classList?.remove('playing-sprite');
      document.getElementById(Object.keys(self._spriteMap)[index])?.classList?.add('playing-sprite');
      
      var id = self.play(Object.keys(self._spriteMap)[index]);
      self.sound.once('end', function() {
        if (resolePrmoise) {
          resolve();
        }
        if (repeat && repeated + 1 < repeat) { // + 1 because it's played once before the end callback
          if (delay) {
            setTimeout(() => {
              // no indx + 1 to repeat
              self.playAll(index, delay, repeat, repeated + 1).then((result) => {
                resolve(result);
              });
            }, delay);
          } else {
            self.playAll(index, delay, repeat, repeated + 1).then((result) => {
              resolve(result);
            });
          }
        } else if (index + 1 < Object.keys(self._spriteMap).length) {
          if (delay) {
            setTimeout(() => {
              // index + 1 for next sprit
              self.playAll(index + 1, delay, repeat, 0).then((result) => {
                resolve(result);
              });
            }, delay);
          } else {
            self.playAll(index + 1, delay, repeat, 0).then((result) => {
              resolve(result);
            });
          }
        }
      }, id);
      
    });
  },
  /**
   * Called on window resize to correctly position and size the click overlays.
   */
  resize: function() {
    var self = this;

    // Calculate the scale of our window from "full" size.
    var scale = window.innerWidth / 3600;

    // Resize and reposition the sprite overlays.
    // var keys = Object.keys(self._spriteMap);
    // for (var i=0; i<keys.length; i++) {
    //   var sprite = window[keys[i]];
    //   // sprite.style.width = Math.round(self._width[i] * scale) + 'px';
    //   if (self._left[i]) {
    //     sprite.style.left = Math.round(self._left[i] * scale) + 'px';
    //   }
    // }
  },

  /**
   * The step called within requestAnimationFrame to update the playback positions.
   */
  step: function() {
    var self = this;

    // Loop through all active sounds and update their progress bar.
    for (var i=0; i<self.sounds.length; i++) {
      var id = parseInt(self.sounds[i].id, 10);
      var offset = self._sprite[self.sounds[i].dataset.sprite][0];
      var seek = (self.sound.seek(id) || 0) - (offset / 1000);
      self.sounds[i].style.width = (((seek / self.sound.duration(id)) * 100) || 0) + '%';
    }

    requestAnimationFrame(self.step.bind(self));
  }
};


var spriteMap_1 = [
  "Good morning.  בוקר טוב.",
"Good evening.  ערב טוב.",
"Good night.  לילה טוב.",
"Thank you very much.  תודה רבה.",
"You're welcome.  על לא דבר.",
"Let's go.  בוא נלך.",
"How are you?  מה שלומך?",
"What's up?  מה נשמע?",
"What's going on?  מה קורה?",
"I'm fine.  אני בסדר.",
"Nice to meet you.  נעים מאוד.",
"I speak a little Hebrew.  אני מדבר קצת עברית.",
"Please correct my Hebrew mistakes.  תקן בבקשה את הטעויות שלי בעברית.",
"I don't understand.  אני לא מבין.",
"Could you repeat that?  אתה יכול לחזור על זה?",
"What did you say?  מה אמרת?",
"What's your name?  מה שמך?",
"My name is…  שמי...",
"Where are you from?  מאיפה אתה?",
"I'm from the US.  אני מארצות הברית.",
"Where do you live?  איפה אתה גר?",
"I live in Tel Aviv.  אני גר בתל אביב.",
"How long have you been in Israel?  כמה זמן אתה נמצא בארץ?",
"I've been in Israel for one and a half years.  אני בארץ שנה וחצי.",
"How long do you intend to stay in Israel?  כמה זמן אתה מתכוון להישאר בישראל?"
];
var spriteMap_2 = [
  "I'm staying in Israel for two years.  אני נשאר בישראל שנתיים.",
"I need to go now.  אני צריך ללכת עכשיו.",
"How old are you?  בן כמה אתה?",
"I'm…years old.  אני בן...",
"Are you married?  אתה נשוי?",
"I'm married.  אני נשוי.",
"I'm single.  אני רווק.",
"Do you have children?  יש לכם ילדים?",
"We don't have any children.  אין לנו ילדים.",
"We have three kids.  יש לנו שלושה ילדים.",
"Why are you in Israel?  למה אתה בארץ?",
"I'm here for ten days.  אני פה לעשרה ימים.",
"I work at…  אני עובד ב...",
"I'm studying…  אני לומד...",
"When do you go back to the US?  מתי אתה חוזר לארצות הברית?",
"What is that?  מה זה?",
"What's wrong?  מה קרה?",
"It doesn't matter.  לא משנה.",
"I have no idea.  אין לי מושג.",
"I'm tired.  אני עייף.",
"I'm hungry.  אני רעב.",
"I'm sick.  אני חולה.",
"I don't feel well.  אני מרגיש לא טוב.",
"I'm thirsty.  אני צמא.",
"I'm hot.  חם לי.",
];
var spriteMap_3 = [
  "I'm cold.  קר לי.",
"I'm bored.  אני משועמם.",
"Good luck. (literally: with success)  בהצלחה.",
"Congratulations. (literally: good luck)  מזל טוב.",
"I forgot.  שכחתי.",
"No problem.  אין בעיה.",
"Don't worry.  אל תדאג.",
"Is this the bus to…?  זה האוטובוס ל...?",
"Is this the train to…?  זאת הרכבת ל...?",
"Stop here, please. (to taxi driver)  עצור כאן, בבקשה.",
"What time is it?  מה השעה?",
"Has bus number 123 come by yet?  אוטובוס מספר 123 כבר עבר?",
"I don't know.  אני לא יודע.",
"Come here.  בוא הנה.",
"Good job/Well done. [all the respect]  כל הכבוד.",
"It's beautiful here.  יפה פה.",
"The weather is nice today.  מזג האוויר נחמד היום.",
"It's very hot today.  חם מאוד היום.",
"That's mine.  זה שלי.",
"No smoking. (forbidden to smoke)  אסור לעשן.",
"I want to go to the beach.  אני רוצה ללכת לחוף.",
"What's your phone number?  מה מספר הטלפון שלך?",
"What's your email address?  מה האימייל שלך?",
"Tell me.  תגיד לי.",
"What time do you open?  באיזו שעה אתם פותחים?",

];
var spriteMap_4 = [
  "What time do you close?  באיזו שעה אתם סוגרים?",
"Could you take my picture, please?  אתה יכול לצלם אותי, בבקשה?",
"It's too expensive.  זה יקר מדי.",
"I'm just looking.  אני רק מסתכל.",
"Do you have…? (at a store)  יש לכם...?",
"I'm (not) Jewish.  אני (לא) יהודי.",
"I'm religious.  אני דתי.",
"I'm secular.  אני חילוני.",
"I'm vegetarian.  אני צמחוני.",
"How much does it cost?  כמה זה עולה?",
"Can I pay by credit card?  אפשר לשלם בכרטיס אשראי?",
"Cash only.  מזומן בלבד.",
"Is this kosher?  זה כשר?",
"Want to drink a beer with me this evening?  אתה רוצה לשתות איתי בירה היום בערב?",
"Can I help you?  אני יכול לעזור לך?",
"Are you ready to order?  אתם מוכנים להזמין?",
"Are you ready?  אתה מוכן?",
"Do you want something to drink?  אתה רוצה לשתות משהו?",
"Who has the best hummus in Israel?  למי יש את החומוס הכי טוב בארץ?",
"A glass of water please.  כוס מים בבקשה.",
"Anything else?  עוד משהו?",
"Check, please.  חשבון, בבקשה.",
"Can you break this? (big bill into smaller bills)  אפשר לפרוט?",
"Where's the restroom?  איפה השירותים?",
"Same thing.  אותו דבר.",
"I need to practice my Hebrew.  אני צריך לתרגל את העברית שלי.",
];
var combinedLabels = [
  ...spriteMap_1, ...spriteMap_2, ...spriteMap_3, ...spriteMap_4
];
var spriteMap1 = {};
var spriteMap2 = {};
var spriteMap3 = {};
var spriteMap4 = {};
spriteMap_1.forEach((item, index) => {
  spriteMap1['sprite' + index] = item;
});
spriteMap_2.forEach((item, index) => {
  spriteMap2['sprite' + (index + 25)] = item;
});
spriteMap_3.forEach((item, index) => {
  spriteMap3['sprite' + (index + 50)] = item;
});
spriteMap_4.forEach((item, index) => {
  spriteMap4['sprite' + (index + 75)] = item;
});
var spritContainer = document.querySelector('.sprites');
// const combinedSprite = {...spriteMap1, ...spriteMap2, ...spriteMap3, ...spriteMap4};

function addSprites(sprite, offset) {
  Object.keys(sprite).forEach(function(key, index) {
    var sprit = document.createElement('div');
    sprit.setAttribute('id', key);
    sprit.setAttribute('class', 'sprite');
    sprit.innerHTML = `<div class="sprite-label">${offset + index + 1}. ${sprite[key]}</div>`;
    spritContainer.appendChild(sprit);
    // if ((index + 1) % 25 == 0) {
    //   var hr = document.createElement('hr');
    //   spritContainer.appendChild(hr);
    // }
    window[key] = sprit;
  });
}
addSprites(spriteMap1, 0);
addSprites(spriteMap2, 25);
addSprites(spriteMap3, 50);
addSprites(spriteMap4, 75);
var spritesArray = [];
// Setup our new sprite class and pass in the options.

var sprite_1 = new Sprite({
  src: ['100_phrases_1-25.mp3'],
  buffer: true,
  sprite: {
    [combinedLabels[0]]: [0, 4 * 1000],
    [combinedLabels[1]]: [4 * 1000, 5 * 1000],
    [combinedLabels[2]]: [9 * 1000, 5 * 1000],
    [combinedLabels[3]]: [13.7 * 1000, 4.9 * 1000],
    [combinedLabels[4]]: [18 * 1000, 5 * 1000],
    [combinedLabels[5]]: [23 * 1000, 5 * 1000],

    [combinedLabels[6]]: [28 * 1000, 5 * 1000],
    [combinedLabels[7]]: [38 * 1000, 5 * 1000],
    [combinedLabels[8]]: [42 * 1000, 5 * 1000],
    [combinedLabels[9]]: [56.5 * 1000, 5 * 1000],
    [combinedLabels[10]]: [61.7 * 1000, 5 * 1000],
    [combinedLabels[11]]: [66.8 * 1000, 7 * 1000],
    [combinedLabels[12]]: [82 * 1000, 9 * 1000],
    [combinedLabels[13]]: [91 * 1000, 6 * 1000],
    [combinedLabels[14]]: [103 * 1000, 7 * 1000],
    [combinedLabels[15]]: [116 * 1000, 5 * 1000],
    [combinedLabels[16]]: [127 * 1000, 4 * 1000],
    [combinedLabels[17]]: [146 * 1000, 2 * 1000],
    [combinedLabels[18]]: [152.8 * 1000, 5 * 1000],
    [combinedLabels[19]]: [162 * 1000, 7 * 1000],
    [combinedLabels[20]]: [169 * 1000, 5 * 1000],
    [combinedLabels[21]]: [180 * 1000, 6 * 1000],
    [combinedLabels[22]]: [194 * 1000, 7 * 1000],
// new file
    [combinedLabels[23]]: [194 * 1000, 1 * 1000],
    [combinedLabels[24]]: [194 * 1000, 1 * 1000],
    [combinedLabels[25]]: [194 * 1000, 1 * 1000],
  },
  spriteMap: spriteMap1
});
spritesArray.push(sprite_1);

var sprite_2 = new Sprite({
  src: ['100_phrases_26-50.mp3'],
  buffer: true,
  sprite: {
    [combinedLabels[25]]: [0, 8 * 1000],
    [combinedLabels[26]]: [16 * 1000, 7 * 1000],
    [combinedLabels[27]]: [31 * 1000, 5 * 1000],

    [combinedLabels[28]]: [41 * 1000, 2 * 1000],
    [combinedLabels[29]]: [47 * 1000, 9 * 1000],
    [combinedLabels[30]]: [57 * 1000, 5 * 1000],

    [combinedLabels[31]]: [67 * 1000, 5 * 1000],
    [combinedLabels[32]]: [78 * 1000, 5 * 1000],
    [combinedLabels[33]]: [84 * 1000, 5 * 1000],
    [combinedLabels[34]]: [89.5 * 1000, 7 * 1000],
    [combinedLabels[35]]: [96 * 1000, 5 * 1000],
    [combinedLabels[36]]: [108 * 1000, 5 * 1000],

    [combinedLabels[37]]: [114 * 1000, 5 * 1000],
    [combinedLabels[38]]: [125 * 1000, 5 * 1000],
    [combinedLabels[39]]: [135 * 1000, 7 * 1000],
    [combinedLabels[40]]: [150 * 1000, 4 * 1000],

    [combinedLabels[41]]: [154 * 1000, 4 * 1000],
    [combinedLabels[42]]: [158 * 1000, 4 * 1000],
    [combinedLabels[43]]: [162 * 1000, 5 * 1000],
    [combinedLabels[44]]: [168 * 1000, 4 * 1000],
    [combinedLabels[45]]: [177.5 * 1000, 4 * 1000],
    [combinedLabels[46]]: [187 * 1000, 4 * 1000],
    [combinedLabels[47]]: [196.7 * 1000, 5 * 1000],
    [combinedLabels[48]]: [209 * 1000, 4 * 1000],
    [combinedLabels[49]]: [218.5 * 1000, 4 * 1000],
  },
  spriteMap: spriteMap2
});
spritesArray.push(sprite_2);

var sprite_3 = new Sprite({
  src: ['100_phrases_51-75.mp3'],
  buffer: true,
  sprite: {
    [combinedLabels[50]]: [0, 4 * 1000],
    [combinedLabels[51]]: [4 * 1000, 4 * 1000],
    [combinedLabels[52]]: [15 * 1000, 2 * 1000],

    [combinedLabels[53]]: [16.8 * 1000, 5 * 1000],
    [combinedLabels[54]]: [23 * 1000, 2 * 1000],
    [combinedLabels[55]]: [25 * 1000, 4 * 1000],

    [combinedLabels[56]]: [30 * 1000, 3.5 * 1000],
    [combinedLabels[57]]: [34 * 1000, 7 * 1000],
    [combinedLabels[58]]: [41 * 1000, 6 * 1000],
    [combinedLabels[59]]: [47 * 1000, 6 * 1000],

    [combinedLabels[60]]: [53 * 1000, 5 * 1000],
    [combinedLabels[61]]: [58 * 1000, 10 * 1000],

    [combinedLabels[62]]: [69 * 1000, 5 * 1000],
    [combinedLabels[63]]: [79.7 * 1000, 4 * 1000],
    [combinedLabels[64]]: [84 * 1000, 5 * 1000],
    [combinedLabels[65]]: [89 * 1000, 5 * 1000],

    [combinedLabels[66]]: [94 * 1000, 7 * 1000],
    [combinedLabels[67]]: [101.7 * 1000, 5 * 1000],

    [combinedLabels[68]]: [107 * 1000, 5 * 1000],
    [combinedLabels[69]]: [112 * 1000, 5 * 1000],
    [combinedLabels[70]]: [117 * 1000, 7.4 * 1000],
    [combinedLabels[71]]: [133 * 1000, 7.5 * 1000],
    [combinedLabels[72]]: [148 * 1000, 6 * 1000],
    [combinedLabels[73]]: [160 * 1000, 4 * 1000],
    [combinedLabels[74]]: [169 * 1000, 8 * 1000],
  },
  spriteMap: spriteMap3
});
spritesArray.push(sprite_3);

var sprite_4 = new Sprite({
  src: ['100_phrases_76-100.mp3'],
  buffer: true,
  sprite: {
    [combinedLabels[75]]: [0, 6 * 1000],
    [combinedLabels[76]]: [6 * 1000, 7 * 1000],
    [combinedLabels[77]]: [21 * 1000, 5 * 1000],

    [combinedLabels[78]]: [26 * 1000, 5 * 1000],
    [combinedLabels[79]]: [37 * 1000, 5 * 1000],
    [combinedLabels[80]]: [42 * 1000, 5.7 * 1000],

    [combinedLabels[81]]: [53.8 * 1000, 4 * 1000],
    [combinedLabels[82]]: [62 * 1000, 5 * 1000],

    [combinedLabels[83]]: [72 * 1000, 5 * 1000],
    [combinedLabels[84]]: [83 * 1000, 5 * 1000],

    [combinedLabels[85]]: [89 * 1000, 7 * 1000],
    [combinedLabels[86]]: [97 * 1000, 6 * 1000],

    [combinedLabels[87]]: [103 * 1000, 5 * 1000],
    [combinedLabels[88]]: [108 * 1000, 8 * 1000],
    [combinedLabels[89]]: [127 * 1000, 6 * 1000],
    [combinedLabels[90]]: [140 * 1000, 5 * 1000],

    [combinedLabels[91]]: [145.5 * 1000, 4 * 1000],
    [combinedLabels[92]]: [153.8 * 1000, 5.6 * 1000],

    [combinedLabels[93]]: [166.5 * 1000, 7.4 * 1000],
    [combinedLabels[94]]: [174.5 * 1000, 4.8 * 1000],
    [combinedLabels[95]]: [180 * 1000, 4.3 * 1000],
    [combinedLabels[96]]: [184.3 * 1000, 4 * 1000],
    [combinedLabels[97]]: [189 * 1000, 5 * 1000],
    [combinedLabels[98]]: [195 * 1000, 4 * 1000],
    [combinedLabels[99]]: [199.8 * 1000, 5 * 1000],
    [combinedLabels[100]]: [205 * 1000, 7 * 1000],
  },
  spriteMap: spriteMap4
});
spritesArray.push(sprite_4);

function addAudioSentances(name, sentences, addToArray = true) {
  var spriteMap = {};
  Object.keys(sentences).forEach((key) => {
    var sprit = document.createElement('div');
    sprit.setAttribute('id', key.replace(/ /g,'-'));
    sprit.setAttribute('class', 'sprite');
    sprit.innerHTML = `<div class="sprite-label">${key}</div>`;
    spritContainer.appendChild(sprit);
    window[key] = sprit;
    spriteMap[key] = key;
  });
  var newSprite =  new Sprite({
    src: [name + '.mp3'],
    buffer: true,
    sprite: sentences,
    spriteMap: spriteMap,
  });
  if (addToArray) {
    spritesArray.push(newSprite);
  }

  return newSprite;
}
function addAudio (name, label, time = 1) {
  var sprit = document.createElement('div');
  sprit.setAttribute('id', name.replace(/ /g,'-'));
  sprit.setAttribute('class', 'sprite');
  sprit.innerHTML = `<div class="sprite-label">${label || name}</div>`;
  spritContainer.appendChild(sprit);
  window[name] = sprit;
  
  var newSprite = new Sprite({
    src: [name + '.mp3'],
    buffer: true,
    sprite: {
      [name]: [0, time * 1000],
    },
    spriteMap: {
      [name]: name
    }
  });
  spritesArray.push(newSprite);

  return newSprite;
}

var sprite_5 = addAudioSentances('i wonder who will find sinwar socks', {
  'i wonder who will find sinwar socks מעניין מי תמצא את הגרביים של יחיאה סינוואר': [0, 3 * 1000],
});

var sprite_5 = addAudioSentances('do not know him', {
  'I do not know. אני לא מכיר.': [0, 1 * 1000],
  'you know me.  אתה מכיר אותי.': [1.1 * 1000, 1.1 * 1000],
  // 'you do not know .  אתה לא מכיר.': [2.2 * 1000, 1.1 * 1000],
  ' I do not know him.  אני לא מכיר אותו.': [3.5 * 1000, 1.3 * 1000],
  'I don\'t know Ahmed.  אני לא מכיר את אחמד. ': [4.8 * 1000, 1.4 * 1000],
});

var sprite_5 = addAudioSentances('forgive me', {
  'forgive me סלח לי': [0, .8 * 1000],
  'do i know you? האם אני מכיר אותך.': [.88 * 1000, 1.5 * 1000],
});

var sprite_5 = addAudioSentances('stupid', {
  'stupid אתה טיפש': [0, .9 * 1000],
  'dumb אתה מטוּמטם': [1 * 1000, 2 * 1000],
});

var sprite_6 = addAudioSentances('wait wait', {
  'I saw it with my own eyes ראית במו עיניי': [0, 1.31 * 1000],
  'all you do is killing כל מה שאתה עושה להרוג': [1.4 * 1000, 1.5 * 1000],
  'what are you doing here למה אתה פה': [3 * 1000, 1.25 * 1000],
  'lier שקרן': [4.3 * 1000, .8 * 1000],
  'lies שקרים': [5.2 * 1000, .7 * 1000],
  'wait wait רגע רגע': [6 * 1000, 1 * 1000],
});

var sprite_7 = addAudio('smart','I am smart אני פיקח');
var sprite_8 = addAudio('sure sure', 'sure sure בטח בטח');
var sprite_9 = addAudio('I can not read', 'I can not read אני לא יכול לקרוא', 2);
var sprite_10 = addAudio('I am sorry', 'I am sorry אני מצטער', 2);
var sprite_11 = addAudio('do not know what are you talking about','idk what are you talking about אני לא יודע מה אתה מדבר', 2);
var sprite_12 = addAudio('what do you mean','what do you mean למה את מתכוונת', 2);
var sprite_13 = addAudioSentances('mesc', {
  'He died for nothing הוא מת לחינם': [0, 1.04 * 1000],
  'Shoes Yahya נעליים של': [1.2 * 1000, 1.5 * 1000],
  'Mesage ending. Thanks Friend חברה תודה': [3 * 1000, 1 * 1000],
});
var sprite_14 = addAudioSentances('love', {
  'I\'m kidding אני צוחק': [0, 1.04 * 1000],
  'My Love אהבה שלי ': [1.2 * 1000, 1.2 * 1000],
  'Why did you choose this city? למה בחרת בעיר הזו?': [2.5 * 1000, 1.6 * 1000],
});
var sprite_15 = addAudioSentances('why this country', {
  'למה המדינה הזאת? why this country': [0, 2 * 1000],
});

var sprite_16 = addAudioSentances('tell me u joking', {
  'תגיד אתה צוחק tell me you are joking?': [0, 4 * 1000],
});

var sprite_17 = addAudioSentances('open-close', {
  'what time do they close מתי הם נסגרים': [0, 1.2 * 1000],
  'what time do they close מתי הם נפתחים': [1.3 * 1000, 1.5 * 1000],
  'the weather is nice today מזג האוויר נחמד היום': [2.7 * 1000, 2 * 1000],
});
addAudioSentances('anyone knows when they open', {
  'anyone know when they open? מישהו יודע מתי נפתחי?': [0, 2 * 1000],
});
addAudioSentances('Does anyone know when the cinema opens', {
  'Does anyone know when the cinema opens? מתי נפתח הקולנוע מישהו יודע?': [0, 2 * 1000],
});
addAudioSentances('you think. i think. they think', {
  'you think. i think. they think אתה חושב. אני חושב. הם חושב.': [0, 3 * 1000],
});

addAudioSentances('I think you should stay silent', {
  'I think you should stay silent אני חושב שאתה צריך לשתוק': [0, 2 * 1000],
});

addAudioSentances('you ask me', {
  'are you asking me?  אתה שואל אותי.': [2 * 1000, 1.5 * 1000],
  'you are asking BiBi, right? אתה שואל את ביבי נכון.': [0 * 1000, 2 * 1000],
  // 'if you ask me  אם אתה שואל אותי.': [3.5 * 1000, 1.3 * 1000],
});
addAudioSentances('if you ask me', {
  'if you ask me  אם אתה שואל אותי.': [0 * 1000, 1.5 * 1000],
});

var sprite500 = addAudioSentances('500_words_1-100', {
  'dad	a-ba	אבא': [0 * 1000, 1.1 * 1000],
  'watermelon	a-va-ti-akh	אבטיח': [1.3 * 1000, 1.2 * 1000],
  'Spring	a-viv	אביב': [2.7 * 1000, 1.2 * 1000],
  'but	a-val	אבל': [4.050 * 1000, 1.2 * 1000],
  'thumb	a-gu-dal	אגודל': [5.4 * 1000, 1.35 * 1000],
  'walnut	e-goz me-lekh	אגוז מלך': [6.75 * 1000, 1.35 * 1000],
  'pear	a-gas	אגס': [8.100 * 1000, 1.35 * 1000],
  'red	a-dom	אדום': [9.450 * 1000, 1.35 * 1000],
  'or	o	או': [10.8 * 1000, 1.35 * 1000],
  'ear	o-zen	אוזן': [12.15 * 1000, 1.35 * 1000],
  'bus	o-to-bus	אוטובוס': [13.5 * 1000, 1.35 * 1000],
  'food	o-khel	אוכל': [14.850 * 1000, 1.35 * 1000],
  'maybe	u-lai	אולי': [16.2 * 1000, 1.35 * 1000],
  'university	u-ni-ver-si-ta	אוניברסיטה': [17.55 * 1000, 1.35 * 1000],
  'bicycle	o-fa-na-yim	אופניים': [18.9 * 1000, 1.35 * 1000],
  'rice	o-rez	אורז': [20.35 * 1000, 1.35 * 1000],
  'so, then	az	אז': [21.6 * 1000, 1.35 * 1000],
  'brother	akh	אח': [22.95 * 1000, 1.35 * 1000],
  'sister	a-khot	אחות': [24.3 * 1000, 1.35 * 1000],
  'last, final	a-kha-ron	אחרון': [25.65 * 1000, 1.35 * 1000],
  'which	ei-ze	איזה': [27 * 1000, 1.35 * 1000],
  'slow	i-ti	איטי': [28.35 * 1000, 1.35 * 1000],
  'how	eikh	איך': [29.7 * 1000, 1.35 * 1000],
  'mom	i-ma	אימא': [31 * 1000, 1.3 * 1000],
  'there isn’t/aren’t	ein	אין': [32.4 * 1000, 1.15 * 1000],
  'where	ei-fo	איפה': [33.6 * 1000, 1 * 1000],
  'wife	i-sha	אישה': [34.7 * 1000, 1.35 * 1000],
  'if	im	אם': [35.3 * 1000, 1.2 * 1000],
  'English	an-glit	אנגלית': [37 * 1000, 1.35 * 1000],
  'we	a-nakh-nu	אנחנו': [38 * 1000, 1.35 * 1000],
  'I	a-ni	אני': [39.29 * 1000, 1.35 * 1000],
  'pineapple	a-na-nas	אננס': [41 * 1000, 1.35 * 1000],
  'forbidden	a-sur	אסור': [42.35 * 1000, 1.35 * 1000],
  'nose	af	אף': [43.7 * 1000, 1.35 * 1000],
  'peach	a-far-sek	אפרסק': [45.05 * 1000, 1.35 * 1000],
  '(it is) possible	ef-shar	אפשר': [46.4 * 1000, 1.35 * 1000],
  'finger, toe	ets-ba	אצבע': [47.75 * 1000, 1.35 * 1000],
  'breakfast	a-ru-khat bo-ker	ארוחת בוקר': [49.1 * 1000, 1.5 * 1000],
  'dinner	a-ru-khat e-rev	ארוחת ערב': [50.9 * 1000, 1.35 * 1000],

  // 'lunch	a-ru-khat tso-ho-ra-yim	ארוחת צהריים': [51.8 * 1000, 1.35 * 1000],
  // 'wallet	ar-nak	ארנק': [53.15 * 1000, 1.35 * 1000],
  // 'grapefruit	esh-ko-lit	אשכולית': [54.5 * 1000, 1.35 * 1000],
  // 'you (f.)	at	את': [55.85 * 1000, 1.35 * 1000],
  // 'you (m.)	a-ta	אתה': [57.2 * 1000, 1.35 * 1000],
  // 'you (m.p.)	a-tem	אתם': [58.55 * 1000, 1.35 * 1000],
  // 'yesterday	et-mol	אתמול': [59.900000000000006 * 1000, 1.35 * 1000],
  // 'you (f.p.)	a-ten	אתן': [61.25 * 1000, 1.35 * 1000],
  // 'in, at	be, ba	ב...': [62.6 * 1000, 1.35 * 1000],
  // 'please	be-va-ka-sha	בבקשה': [63.95 * 1000, 1.35 * 1000],
  // 'clothes	be-ga-dim	בגדים': [65.3 * 1000, 1.35 * 1000],
  // 'good luck	be-hats-la-kha	בהצלחה': [66.65 * 1000, 1.35 * 1000],
  // 'morning	bo-ker	בוקר': [68 * 1000, 1.35 * 1000],
  // 'outside	ba-khuts	בחוץ': [69.35 * 1000, 1.35 * 1000],
  // 'sweet potato	ba-ta-ta	בטטה': [70.7 * 1000, 1.35 * 1000],
  // 'stomach/abdomen/tummy	be-ten	בטן': [72.05 * 1000, 1.35 * 1000],
  // 'together	be-ya-khad	ביחד': [73.4 * 1000, 1.35 * 1000],
  // 'medium	bei-no-ni	בינוני': [74.75 * 1000, 1.35 * 1000],
  // 'egg	bei-tsa	ביצה': [76.1 * 1000, 1.35 * 1000],
  // 'beer	bi-ra	בירה': [77.45 * 1000, 1.35 * 1000],
  // 'house	ba-yit	בית': [78.80 * 1000, 1.35 * 1000],
  // 'hospital	beit kho-lim	בית חולים': [80.15 * 1000, 1.35 * 1000],
  // 'synagogue	beit kne-set	בית כנסת': [81.5 * 1000, 1.35 * 1000],
  // 'pharmacy	beit mir-ka-khat	בית מרקחת': [82.85 * 1000, 1.35 * 1000],
  // 'school	beit se-fer	בית ספר': [84.2 * 1000, 1.35 * 1000],
  // 'without	bli	בלי': [85.55000000000001 * 1000, 1.35 * 1000],
  // 'son	ben	בן': [86.9 * 1000, 1.35 * 1000],
  // 'cousin	ben dod	בן דוד': [88.25 * 1000, 1.35 * 1000],
  // 'gasoline	ben-zin	בנזין': [89.6 * 1000, 1.35 * 1000],
  // 'building	bin-yan	בניין': [90.95 * 1000, 1.35 * 1000],
  // 'banana	ba-na-na	בננה': [92.30000000000001 * 1000, 1.35 * 1000],
  // 'bank	bank	בנק': [93.65 * 1000, 1.35 * 1000],
  // 'okay	be-se-der	בסדר': [95 * 1000, 1.35 * 1000],
  // 'husband	ba-al	בעל': [96.35 * 1000, 1.35 * 1000],
  // 'inside	bif-nim	בפנים': [97.7 * 1000, 1.35 * 1000],
  // 'onion	ba-tsal	בצל': [99.05000000000001 * 1000, 1.35 * 1000],
  // 'bottle	bak-buk	בקבוק': [100.4 * 1000, 1.35 * 1000],
  // 'beef	ba-kar	בקר': [101.75 * 1000, 1.35 * 1000],
  // 'soon	be-ka-rov	בקרוב': [103.1 * 1000, 1.35 * 1000],
  // 'healthy	ba-ri	בריא': [104.45 * 1000, 1.35 * 1000],
  // 'meat	ba-sar	בשר': [105.80000000000001 * 1000, 1.35 * 1000],
  // 'daughter	bat	בת': [107.15 * 1000, 1.35 * 1000],
  // 'cockroach	juk	ג\'וק': [108.5 * 1000, 1.35 * 1000],
  // 'back	gav	גב': [109.85000000000001 * 1000, 1.35 * 1000],
  // 'high	ga-vo-ha	גבוה': [111.2 * 1000, 1.35 * 1000],
  // 'cheese	gvi-na	גבינה': [112.55000000000001 * 1000, 1.35 * 1000],
  // 'big	ga-dol	גדול': [113.9 * 1000, 1.35 * 1000],
  // 'height	go-va	גובה': [115.25 * 1000, 1.35 * 1000],
  // 'body	guf	גוף': [116.60000000000001 * 1000, 1.35 * 1000],
  // 'carrot	ge-zer	גזר': [117.95 * 1000, 1.35 * 1000],

  'ice cream	gli-da	גלידה': [121 * 1000, 1.35 * 1000],
  'also	gam	גם': [122.2 * 1000, 1.35 * 1000],
  'socks	gar-ba-yim	גרביים': [123.6 * 1000, 1.35 * 1000],
  'rain	ge-shem	גשם': [124.6000000000001 * 1000, 1.35 * 1000],
  'honey	dvash	דבש': [125.9 * 1000, 1.35 * 1000],
  'fish	dag	דג': [127.4 * 1000, 1.35 * 1000],
  'mail; post office	do-ar	דואר': [128.4 * 1000, 1.35 * 1000],
  'cherry	duv-de-van	דובדבן': [129.75 * 1000, 1.35 * 1000],
  'uncle	dod	דוד': [131.4 * 1000, 1.35 * 1000],
  'aunt	do-da	דודה': [132.2 * 1000, 1.35 * 1000],
  'apartment	di-ra': [133.8 * 1000, 1.35 * 1000],
}, false);

function playAll() {
  document.querySelectorAll('.sprite > .sprite-label').forEach((item, index) => {
    setTimeout(() => {
        item.click();
    }, index * 6000);
  })
}

function playSprits(sprites, index, delay) {
  if (index >= sprites.length) {
    return;
  }
  currentAudio = sprites[index];
  var repeatTimes = currentAudio._sprite.length > 10 ? 1 : 2;
  currentAudio.playAll(0, 2000, repeatTimes).then(() => {
    setTimeout(() => {
      playSprits(sprites, index + 1, 2000);
    }, delay);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var currentAudio;
function playAll() {
  currentAudio?.sound?.unload();
  // shuffleArray(spritesArray);
  playSprits(spritesArray.slice(4), 0, 2000);
}
function playAll500() {
  currentAudio?.sound?.unload();
  // shuffleArray(spritesArray);
  playSprits([sprite500], 0, 2000);
}
function playAll100(index) {
  currentAudio?.sound?.unload();
  // shuffleArray(spritesArray);
  if (index) {
    playSprits([spritesArray[index]], 0, 2000);
  } else {
    playSprits(spritesArray.slice(0, 4), 0, 2000);
  }
}

function pauseAudio() {
  currentAudio?.sound?.pause();
}
function resumeAudio() {
  currentAudio?.sound?.play();
}