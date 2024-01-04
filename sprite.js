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
      
      document.querySelector('#' + key.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,/g,'-'))?.querySelector('.sprite-label')?.addEventListener('click', function(e) {
        self.play(key);
        self._currentPlayingEl = e.target;
      }, false);

      document.querySelector('#' + key.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,/g,'-'))?.querySelector('label')?.addEventListener('click', function(e) {
        var items = {};
        document.querySelectorAll('.sprite').forEach((item, index) => {
            console.log(item.querySelector('input').checked)
            items[item.id] = item.querySelector('input').checked
        });
        localStorage.setItem('sprites', JSON.stringify(items));
      }, false);

    });

    // self.sound.on('end', function(event) {
    //   var customEvent = new Event('spritePlayEnded', {
    //     bubbles: true,
    //     detail: self._currentPlayingEl
    //   });
    //   self._currentPlayingEl.dispatchEvent(customEvent);
    // });
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
  playSelected: function(key) {
    var self = this;
    var sprite = self._spriteMap[key];

    // Play the sprite sound and capture the ID.
    var id = self.sound.play(sprite);
    return new Promise((resolve) => {
      self.sound.once('end', function() {
          resolve();
      }, id);
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
      var currentPlayingId = Object.keys(self._spriteMap)[index]?.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,/g,'-');
      var currentElement = document.getElementById(currentPlayingId);
      currentElement?.classList?.add('playing-sprite');
      
      scrollToItem(currentElement);

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

function addSprites(sprite, spriteObjName, offset) {
  Object.keys(sprite).forEach(function(key, index) {
    var sprit = document.createElement('div');
    sprit.setAttribute('id', key);
    sprit.setAttribute('class', 'sprite');
    sprit.innerHTML = `<label><input data-sprite-key="${key}" data-sprites-obj="${spriteObjName}" type="checkbox">
      </label><div class="sprite-label">${offset + index + 1}. ${sprite[key]}</div>`;
    spritContainer.appendChild(sprit);
    // if ((index + 1) % 25 == 0) {
    //   var hr = document.createElement('hr');
    //   spritContainer.appendChild(hr);
    // }
    window[key] = sprit;
  });
}
addSprites(spriteMap1, 'sprite_1', 0);
addSprites(spriteMap2, 'sprite_2', 25);
addSprites(spriteMap3, 'sprite_3', 50);
addSprites(spriteMap4, 'sprite_4', 75);
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

var sentanceIndex = 1;

function addAudioSentances(name, spriteObjName, sentences, addToArray = true) {
  var spriteMap = {};
  Object.keys(sentences).forEach((key, index) => {
    var sprit = document.createElement('div');
    sprit.setAttribute('id', key.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,/g,'-'));
    sprit.setAttribute('class', 'sprite');
    sprit.innerHTML = `<label><input data-sprite-key="${key}" data-sprites-obj="${spriteObjName}" type="checkbox">
    </label><div class="sprite-label">[${sentanceIndex++}] ${key}</div>`;
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
function addAudio (name, spriteObjName, label, time = 1) {
  var sprit = document.createElement('div');
  sprit.setAttribute('id', name.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,/g,'-'));
  sprit.setAttribute('class', 'sprite');
  sprit.innerHTML = `<label><input data-sprite-key="${name}" data-sprites-obj="${spriteObjName}" type="checkbox">
  </label><div class="sprite-label">[${sentanceIndex++}] ${label || name}</div>`;
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
var sprite_5 = addAudioSentances('i wonder who will find sinwar socks', 'sprite_5', {
  'i wonder who will find sinwar socks מעניין מי תמצא את הגרביים של יחיאה סינוואר': [0, 3 * 1000],
});

var sprite_6 = addAudioSentances('do not know him', 'sprite_6', {
  'I do not know אני לא מכיר': [0, 1 * 1000],
  'you know me.  אתה מכיר אותי.': [1.1 * 1000, 1 * 1000],
  // 'you do not know .  אתה לא מכיר.': [2.2 * 1000, 1.1 * 1000],
  ' I do not know him.  אני לא מכיר אותו.': [3.5 * 1000, 1.2 * 1000],
  'I don\'t know Ahmed.  אני לא מכיר את אחמד. ': [4.8 * 1000, 1.4 * 1000],
});

var sprite_7 = addAudioSentances('forgive me', 'sprite_7', {
  'forgive me סלח לי': [0, .8 * 1000],
  'do i know you? האם אני מכיר אותך.': [.88 * 1000, 1.5 * 1000],
});

var sprite_8 = addAudioSentances('stupid', 'sprite_8', {
  'stupid אתה טיפש': [0, .9 * 1000],
  'dumb אתה מטוּמטם': [1 * 1000, 2 * 1000],
});

var sprite_9 = addAudioSentances('wait wait', 'sprite_9', {
  'I saw it with my own eyes ראית במו עיניי': [0, 1.31 * 1000],
  'all you do is killing כל מה שאתה עושה להרוג': [1.4 * 1000, 1.5 * 1000],
  'what are you doing here למה אתה פה': [3 * 1000, 1.25 * 1000],
  'lier שקרן': [4.3 * 1000, .8 * 1000],
  'lies שקרים': [5.2 * 1000, .7 * 1000],
  'wait wait רגע רגע': [6 * 1000, 1 * 1000],
});

var sprite_10 = addAudio('smart', 'sprite_10', 'I am smart אני פיקח');
var sprite_11 = addAudio('sure sure', 'sprite_11', 'sure sure בטח בטח');
var sprite_12 = addAudio('I can not read', 'sprite_12', 'I can not read אני לא יכול לקרוא', 2);
var sprite_13 = addAudio('I am sorry', 'sprite_13', 'I am sorry אני מצטער', 2);
var sprite_14 = addAudio('do not know what are you talking about', 'sprite_14', 'idk what are you talking about אני לא יודע מה אתה מדבר', 2);
var sprite_15 = addAudio('what do you mean', 'sprite_15', 'what do you mean למה את מתכוונת', 2);
var sprite_16 = addAudioSentances('mesc', 'sprite_16', {
  'He died for nothing הוא מת לחינם': [0, 1.04 * 1000],
  'Shoes Yahya נעליים של': [1.2 * 1000, 1.5 * 1000],
  'Mesage ending. Thanks Friend חברה תודה': [3 * 1000, 1 * 1000],
});
var sprite_17 = addAudioSentances('love', 'sprite_17', {
  'I\'m kidding אני צוחק': [0, 1.04 * 1000],
  'My Love אהבה שלי ': [1.2 * 1000, 1.2 * 1000],
  'Why did you choose this city? למה בחרת בעיר הזו?': [2.5 * 1000, 1.6 * 1000],
});
var sprite_18 = addAudioSentances('why this country', 'sprite_18', {
  'למה המדינה הזאת? why this country': [0, 2 * 1000],
});

var sprite_19 = addAudioSentances('tell me u joking', 'sprite_19', {
  'תגיד אתה צוחק tell me you are joking?': [0, 4 * 1000],
});

var sprite_20 = addAudioSentances('open-close', 'sprite_20', {
  'what time do they close מתי הם נסגרים': [0, 1.2 * 1000],
  'what time do they close מתי הם נפתחים': [1.3 * 1000, 1.5 * 1000],
  'the weather is nice today מזג האוויר נחמד היום': [2.7 * 1000, 2 * 1000],
});
var sprite_21 = addAudioSentances('anyone knows when they open', 'sprite_21', {
  'anyone know when they open? מישהו יודע מתי נפתחי?': [0, 2 * 1000],
});
var sprite_22 = addAudioSentances('Does anyone know when the cinema opens', 'sprite_22', {
  'Does anyone know when the cinema opens? מתי נפתח הקולנוע מישהו יודע?': [0, 2 * 1000],
});
var sprite_23 = addAudioSentances('you think. i think. they think', 'sprite_23', {
  'you think. i think. they think אתה חושב. אני חושב. הם חושב.': [0, 3 * 1000],
});

var sprite_24 = addAudioSentances('I think you should stay silent', 'sprite_24', {
  'I think you should stay silent אני חושב שאתה צריך לשתוק': [0, 2 * 1000],
});

var sprite_25 = addAudioSentances('you ask me', 'sprite_25', {
  'are you asking me?  אתה שואל אותי.': [2 * 1000, 1.5 * 1000],
  'you are asking BiBi, right? אתה שואל את ביבי נכון.': [0 * 1000, 2 * 1000],
  // 'if you ask me  אם אתה שואל אותי.': [3.5 * 1000, 1.3 * 1000],
});
var sprite_26 = addAudioSentances('if you ask me', 'sprite_26', {
  'if you ask me  אם אתה שואל אותי.': [0 * 1000, 1.5 * 1000],
});
var sprite_27 = addAudioSentances('time is money', 'sprite_27', {
  'time is money  זמן הוא כסף': [0 * 1000, 2.5 * 1000],
});
var sprite_28 = addAudioSentances('are you rich', 'sprite_28', {
  'are you rich אתה עשיר': [0 * 1000, 2.5 * 1000],
});
var sprite_29 = addAudioSentances('i am broke', 'sprite_29', {
  'I am broke אני מרושש': [0 * 1000, 2.5 * 1000],
});

sentanceIndex = 1;
var sprite500_100 = addAudioSentances('500_words_1-100', 'sprite500_100', {
  'dad a-ba אבא': [0 * 1000, 1.1 * 1000],
  'watermelon a-va-ti-akh אבטיח': [1.3 * 1000, 1.2 * 1000],
  'Spring a-viv אביב': [2.7 * 1000, 1.2 * 1000],
  'but a-val אבל': [4.050 * 1000, 1.2 * 1000],
  'thumb a-gu-dal אגודל': [5.4 * 1000, 1.35 * 1000],
  'walnut e-goz me-lekh אגוז מלך': [6.75 * 1000, 1.35 * 1000],
  'pear a-gas אגס': [8.100 * 1000, 1.35 * 1000],
  'red a-dom אדום': [9.450 * 1000, 1.35 * 1000],
  'or o או': [10.8 * 1000, 1.35 * 1000],
  'ear o-zen אוזן': [12.15 * 1000, 1.35 * 1000],
  'bus o-to-bus אוטובוס': [13.5 * 1000, 1.35 * 1000],
  'food o-khel אוכל': [14.850 * 1000, 1.35 * 1000],
  'maybe u-lai אולי': [16.2 * 1000, 1.35 * 1000],
  'university u-ni-ver-si-ta אוניברסיטה': [17.55 * 1000, 1.35 * 1000],
  'bicycle o-fa-na-yim אופניים': [18.9 * 1000, 1.35 * 1000],
  'rice o-rez אורז': [20.35 * 1000, 1.35 * 1000],
  'so, then az אז': [21.6 * 1000, 1.35 * 1000],
  'brother akh אח': [22.95 * 1000, 1.35 * 1000],
  'sister a-khot אחות': [24.3 * 1000, 1.35 * 1000],
  'last, final a-kha-ron אחרון': [25.65 * 1000, 1.35 * 1000],
  'which ei-ze איזה': [27 * 1000, 1.35 * 1000],
  'slow i-ti איטי': [28.35 * 1000, 1.35 * 1000],
  'how eikh איך': [29.7 * 1000, 1.35 * 1000],
  'mom i-ma אימא': [31 * 1000, 1.3 * 1000],
  'there isn’t/aren’t ein אין': [32.4 * 1000, 1.15 * 1000],
  'where ei-fo איפה': [33.6 * 1000, 1 * 1000],
  'wife i-sha אישה': [34.7 * 1000, 1.35 * 1000],
  'if im אם': [35.3 * 1000, 1.2 * 1000],
  'English an-glit אנגלית': [37 * 1000, 1.35 * 1000],
  'we a-nakh-nu אנחנו': [38 * 1000, 1.35 * 1000],
  'I a-ni אני': [39.29 * 1000, 1.35 * 1000],
  'pineapple a-na-nas אננס': [41 * 1000, 1.35 * 1000],
  'forbidden a-sur אסור': [42.35 * 1000, 1.35 * 1000],
  'nose af אף': [43.7 * 1000, 1.35 * 1000],
  'peach a-far-sek אפרסק': [45.05 * 1000, 1.35 * 1000],
  '(it is) possible ef-shar אפשר': [46.4 * 1000, 1.35 * 1000],
  'finger, toe ets-ba אצבע': [47.75 * 1000, 1.35 * 1000],
  'breakfast a-ru-khat bo-ker ארוחת בוקר': [49.1 * 1000, 1.5 * 1000],
  'dinner a-ru-khat e-rev ארוחת ערב': [50.9 * 1000, 1.35 * 1000],
  'lunch a-ru-khat tso-ho-ra-yim ארוחת צהריים': [52.8 * 1000, 1.35 * 1000],
  'wallet ar-nak ארנק': [54.65 * 1000, 1.35 * 1000],
  'grapefruit esh-ko-lit אשכולית': [55.8 * 1000, 1.35 * 1000],
  'you (f.) at את': [57.5 * 1000, 1.35 * 1000],
  'you (m.) a-ta אתה': [58.7 * 1000, 1.35 * 1000],
  'you (m.p.) a-tem אתם': [59.9 * 1000, 1.35 * 1000],
  'yesterday et-mol אתמול': [61.3 * 1000, 1.35 * 1000],
  'you (f.p.) a-ten אתן': [62.25 * 1000, 1.35 * 1000],
  // 'in, at be, ba ב...': [62 * 1000, 1.35 * 1000],
  'please be-va-ka-sha בבקשה': [66 * 1000, 1.35 * 1000],
  'clothes be-ga-dim בגדים': [67.5 * 1000, 1.2 * 1000],
  'good luck be-hats-la-kha בהצלחה': [68.9 * 1000, 1.35 * 1000],
  'morning bo-ker בוקר': [70.3 * 1000, 1.35 * 1000],
  'outside ba-khuts בחוץ': [71.8 * 1000, 1.35 * 1000],
  'sweet potato ba-ta-ta בטטה': [73.2 * 1000, 1.35 * 1000],

  'stomach/abdomen/tummy be-ten בטן': [74.55 * 1000, 1.3 * 1000], 
'together be-ya-khad ביחד': [75.89999999999999 * 1000, 1.3 * 1000], 
'medium bei-no-ni בינוני': [77.24999999999999 * 1000, 1.3 * 1000], 
'egg bei-tsa ביצה': [78.59999999999998 * 1000, 1.3 * 1000], 
'beer bi-ra בירה': [79.94999999999997 * 1000, 1.3 * 1000], 
'house ba-yit בית': [81.29999999999997 * 1000, 1.3 * 1000], 
'hospital beit kho-lim בית חולים': [82.64999999999996 * 1000, 1.3 * 1000], 
'synagogue beit kne-set בית כנסת': [83.99999999999996 * 1000, 1.3 * 1000], 
'pharmacy beit mir-ka-khat בית מרקחת': [85.34999999999995 * 1000, 1.3 * 1000], 
'school beit se-fer בית ספר': [86.69999999999995 * 1000, 1.3 * 1000], 
'without bli בלי': [88.04999999999994 * 1000, 1.3 * 1000], 
'son ben בן': [89.39999999999993 * 1000, 1.3 * 1000], 
'cousin ben dod בן דוד': [90.74999999999993 * 1000, 1.3 * 1000], 
'gasoline ben-zin בנזין': [92.09999999999992 * 1000, 1.3 * 1000], 
'building bin-yan בניין': [93.44999999999992 * 1000, 1.3 * 1000], 
'banana ba-na-na בננה': [94.79999999999991 * 1000, 1.3 * 1000], 
'bank bank בנק': [96.1499999999999 * 1000, 1.3 * 1000], 
'okay be-se-der בסדר': [97.4999999999999 * 1000, 1.3 * 1000], 
'husband ba-al בעל': [98.8499999999999 * 1000, 1.3 * 1000], 
'inside bif-nim בפנים': [100.19999999999989 * 1000, 1.3 * 1000], 
'onion ba-tsal בצל': [101.54999999999988 * 1000, 1.3 * 1000], 
'bottle bak-buk בקבוק': [102.89999999999988 * 1000, 1.3 * 1000], 
'beef ba-kar בקר': [104.24999999999987 * 1000, 1.3 * 1000], 
'soon be-ka-rov בקרוב': [105.59999999999987 * 1000, 1.3 * 1000], 
'healthy ba-ri בריא': [106.94999999999986 * 1000, 1.3 * 1000], 
'meat ba-sar בשר': [108.29999999999986 * 1000, 1.3 * 1000], 
'daughter bat בת': [109.64999999999985 * 1000, 1.3 * 1000], 
'cockroach juk ג\'וק': [110.99999999999984 * 1000, 1.3 * 1000], 
'back gav גב': [112.34999999999984 * 1000, 1.3 * 1000], 
'high ga-vo-ha גבוה': [113.69999999999983 * 1000, 1.3 * 1000], 
'cheese gvi-na גבינה': [115.04999999999983 * 1000, 1.3 * 1000], 
'big ga-dol גדול': [116.39999999999982 * 1000, 1.1 * 1000], 
'height go-va גובה': [117.74999999999982 * 1000, 1.1 * 1000], 
'body guf גוף': [119.09999999999981 * 1000, 1.1 * 1000], 
'carrot ge-zer גזר': [120 * 1000, 1.3 * 1000],

  'ice cream gli-da גלידה': [121 * 1000, 1.35 * 1000],
  'also gam גם': [122.2 * 1000, 1.35 * 1000],
  'socks gar-ba-yim גרביים': [123.6 * 1000, 1.35 * 1000],
  'rain ge-shem גשם': [124.6000000000001 * 1000, 1.35 * 1000],
  'honey dvash דבש': [125.9 * 1000, 1.35 * 1000],
  'fish dag דג': [127.4 * 1000, 1.35 * 1000],
  'mail; post office do-ar דואר': [128.4 * 1000, 1.35 * 1000],
  'cherry duv-de-van דובדבן': [129.75 * 1000, 1.35 * 1000],
  'uncle dod דוד': [131.4 * 1000, 1.35 * 1000],
  'aunt do-da דודה': [132.2 * 1000, 1.35 * 1000],
  'apartment di-ra': [133.8 * 1000, 1.35 * 1000],
}, false);
var sprite500_200 = addAudioSentances('500_words_101-200', 'sprite500_200', {
  'door  דלת': [0 * 1000 , 1.2 * 1000],
'minute  דקה': [1.35 * 1000 , 1.2 * 1000],
'South  דרום': [2.7 * 1000 , 1.2 * 1000],
'passport  דרכון': [4.050000000000001 * 1000 , 1.1 * 1000],
'religious  דתי': [5.3 * 1000 , 1.1 * 1000],
'the  ה...': [6.4 * 1000 , 1 * 1000],
'next  הבא': [7.500000000000001 * 1000 , 1.2 * 1000],
'he  הוא': [8.80000000000001 * 1000 , 1 * 1000],
'turkey (animal)  ho-du  הודו': [9.3 * 1000 , 1.2 * 1000],
'present (tense)  ho-ve  הווה': [10.549999999999999 * 1000 , 1.2 * 1000],
'parents  ho-rim  הורים': [11.899999999999999 * 1000 , 1.2 * 1000],
'she  hi  היא': [13.25 * 1000 , 1.2 * 1000],
'today  ha-yom  היום': [14.6 * 1000 , 1.2 * 1000],
'they (m.)  hem  הם': [15.95 * 1000 , 1 * 1000],
'they (f.)  hen  הן': [17 * 1000 , 1.2 * 1000],
'break  haf-sa-ka  הפסקה': [18.2 * 1000 , 1.2 * 1000],
'a lot  har-be  הרבה': [19.7 * 1000 , 1.2 * 1000],
'exercise  hit-am-lut  התעמלות': [21.05 * 1000 , 1.2 * 1000],
'and  ve  ו...': [22.3 * 1000 , 1 * 1000],
'this  ze  זה': [23.4 * 1000 , 1 * 1000],
'cheap  zol  זול': [25.1 * 1000 , 1 * 1000],
'olive  za-yit  זית': [26.45 * 1000 , 1.2 * 1000],
'time  zman  זמן': [27.8 * 1000 , 1.2 * 1000],
  'old (person)  za-ken  זקן': [29.150000000000002 * 1000 , 1.2 * 1000],
  'friend  kha-ver  חבר': [30.5 * 1000 , 1.2 * 1000],
  'company  khev-ra  חברה': [31.85 * 1000 , 1.2 * 1000],
  'holiday  khag  חג': [33.2 * 1000 , 1 * 1000],
  'belt  kha-go-ra  חגורה': [34.2 * 1000 , 1.2 * 1000],
  'room  khe-der  חדר': [35.4 * 1000 , 1.2 * 1000],
  'new  kha-dash  חדש': [36.8 * 1000 , 1 * 1000],
  'news  kha-da-shot  חדשות': [37.8 * 1000 , 1.2 * 1000],
  'month  kho-desh  חודש': [39 * 1000 , 1.2 * 1000],
  'sick  kho-le  חולה': [40.2 * 1000 , 1.2 * 1000],
  'shirt  khul-tsa  חולצה': [41.3 * 1000 , 1.2 * 1000],
  'brown  khum  חום': [43 * 1000 , 1.2 * 1000],
  'hummus  khu-mus  חומוס': [44.35 * 1000 , 0.003 * 1000],
  'beach  khof  חוף': [45.7 * 1000 , 1.2 * 1000],
  'vacation  khuf-sha  חופשה': [47.05 * 1000 , 1.2 * 1000],
  'Winter  kho-ref  חורף': [48.4 * 1000 , 1.2 * 1000],
  'chest  kha-ze  חזה': [49.75 * 1000 , 1.2 * 1000],
  'strong  kha-zak  חזק': [51.1 * 1000 , 1.2 * 1000],
  'milk  kha-lav  חלב': [52.45 * 1000 , 1.2 * 1000],
  'challah  kha-la  חלה': [53.8 * 1000 , 1.2 * 1000],
  'window  kha-lon  חלון': [55.15 * 1000 , 1.2 * 1000],
  'secular  khi-lo-ni  חלוני': [56.5 * 1000 , 1.2 * 1000],
  'hot  kham  חם': [57.85 * 1000 , 1.2 * 1000],
  'butter  khem-a  חמאה': [59.2 * 1000 , 1.2 * 1000],
  'pickles  kha-mu-tsim  חמוצים': [60.55 * 1000 , 1.2 * 1000],
  'store  kha-nut  חנות': [61.900000000000006 * 1000 , 1.3 * 1000],
  'lettuce  kha-sa  חסה': [63.25 * 1000 , 1.3 * 1000],
  'skirt  kha-tsa-it  חצאית': [64.6 * 1000 , 1.3 * 1000],
  'half (of something)  khe-tsi  חצי': [66.15 * 1000 , 1.3 * 1000],
  'spicy (hot)  kha-rif  חריף': [67.5 * 1000 , 1.3 * 1000],
  'bill check  khesh-bon  חשבון': [69 * 1000 , 1.3 * 1000],
  'important  kha-shuv  חשוב': [70.5 * 1000 , 1.2 * 1000],
  'cat  kha-tul  חתול': [71.85 * 1000 , 1.2 * 1000],
  'good  tov  טוב': [73.2 * 1000 , 1.2 * 1000],
  'trip hike  ti-yul  טיול': [74.55 * 1000 , 1.2 * 1000],
  'lamb  ta-le  טלה': [75.9 * 1000 , 1.2 * 1000],
  'tv  te-le-viz-ya  טלוויזיה': [77.25 * 1000 , 1.2 * 1000],
  'telephone  te-le-fon  טלפון': [78.6 * 1000 , 1.2 * 1000],
  'tasty  ta-im  טעים': [79.95 * 1000 , 1.1 * 1000],
  'get going  ya-la  יאללה': [81.2 * 1000 , 1 * 1000],
  'arm  yad  יד': [82.35 * 1000 , 1 * 1000],
  'Jewish  ye-hu-di  יהודי': [83 * 1000 , 1.2 * 1000],
  'yogurt  yo-gurt  יוגורט': [84.35 * 1000 , 1.3 * 1000],
  'day  yom  יום': [85.7 * 1000 , 1 * 1000],
  'Sunday  yom ri-shon  יום ראשון': [88.2 * 1000 , 1.3 * 1000],
  'Monday  yom she-ni  יום שני': [92.45 * 1000 , 1.2 * 1000],
  'Tuesday  yom shli-shi  יום שלישי': [91.4 * 1000 , 1.2 * 1000],
  'Wednesday  yom re-vi-i  יום רביעי': [89.85 * 1000 , 1.2 * 1000],
  'Thursday  yom kha-mi-shi  יום חמישי': [86.8 * 1000 , 1.3 * 1000],
  'Friday  yom shi-shi  יום שישי': [93.6 * 1000 , 1.2 * 1000],
 'singular; single (not married)  ya-khid  יחיד': [94.94999999999999 * 1000 , 1.2 * 1000],
 'wine  ya-yin  יין': [96.3 * 1000 , 1.2 * 1000],
 'boy  ye-led  ילד': [97.64999999999999 * 1000 , 1.2 * 1000],
 'girl  yal-da  ילדה': [99 * 1000 , 1.2 * 1000],
 'sea  yam  ים': [100.35 * 1000 , 1 * 1000],
 'right (direction)  ya-mi-na  ימינה': [101.5 * 1000 , 1.2 * 1000],
 'beautiful  ya-fe  יפה': [102.6 * 1000 , 1.2 * 1000],
 'exit  ye-tsi-a  יציאה': [103.8 * 1000 , 1.2 * 1000],
 'expensive  ya-kar  יקר': [105.75 * 1000 , 1.2 * 1000],
 'green  ya-rok  ירוק': [107.1 * 1000 , 1.2 * 1000],
 'moon  ya-re-akh  ירח': [108.44999999999999 * 1000 , 1.2 * 1000],
 'vegetables  ye-ra-kot  ירקות': [109.8 * 1000 , 1.2 * 1000],
 'there is/are  yesh  יש': [111.14999999999999 * 1000 , 1.2 * 1000],
 'old (thing)  ya-shan  ישן': [112.5 * 1000 , 1.2 * 1000],
 'straight ahead; honest  ya-shar  ישר': [113.85 * 1000 , 1.2 * 1000],
 'Israel  is-ra-el  ישראל': [115.19999999999999 * 1000 , 0.001 * 1000],
 'mosquito  ya-tush  יתוש': [116.55 * 1000 , 1.2 * 1000],
 'as  ke  כ...': [117.89999999999999 * 1000 , 1.2 * 1000],
 'pain/ache  ke-ev  כאב': [119.25 * 1000 , 1.2 * 1000],
 'road, route  kvish  כביש': [120.6 * 1000 , 1.2 * 1000],
 'ball  ka-dur  כדור': [121.94999999999999 * 1000 , 1.2 * 1000],
 'soccer  ka-du-re-gel  כדורגל': [123.3 * 1000 , 1.2 * 1000],
 'basketball  ka-dur-sal  כדורסל': [124.64999999999999 * 1000 , 1.2 * 1000],
 'hat  ko-va  כובע': [126 * 1000 , 1.2 * 1000],
 'star  ko-khav  כוכב': [127.35 * 1000 , 1.2 * 1000],
 'glass, cup  kos  כוס': [128.7 * 1000 , 1.2 * 1000],
 'angry  ko-es  כועס': [130.05 * 1000 , 1.2 * 1000],
}, false);
// var sprite500_300 = addAudioSentances('500_words_201-300', 'sprite500_300', {
//   'blue  כחול': [0 * 1000 , 1.2 * 1000],
// 'chair  כיסא': [1.35 * 1000 , 1.2 * 1000],
// 'classroom  כיתה': [2.7 * 1000 , 1.2 * 1000],
// 'all  כל': [4.050000000000001 * 1000 , 1.2 * 1000],
// 'dog  כלב': [5.4 * 1000 , 1.2 * 1000],
// 'nothing  כלום': [6.75 * 1000 , 1.2 * 1000],
// 'how much  כמה': [8.100000000000001 * 1000 , 1.2 * 1000],
// 'yes  כן': [9.450000000000001 * 1000 , 1.2 * 1000],
// 'entrance  כניסה': [10.8 * 1000 , 1.2 * 1000],
// 'money  כסף': [12.15 * 1000 , 1.2 * 1000],
// 'ATM  כספומט': [13.5 * 1000 , 1.2 * 1000],
// 'spoon  כף': [14.850000000000001 * 1000 , 1.2 * 1000],
// 'hand  כף יד': [16.200000000000003 * 1000 , 1.2 * 1000],
// 'foot  כף רגל': [17.55 * 1000 , 1.2 * 1000],
// 'cabbage  כרוב': [18.900000000000002 * 1000 , 1.2 * 1000],
// 'pillow  כרית': [20.25 * 1000 , 1.2 * 1000],
// 'kosher  כשר': [21.6 * 1000 , 1.2 * 1000],
// 'address  כתובת': [22.950000000000003 * 1000 , 1.2 * 1000],
// 'orange (color)  כתום': [24.3 * 1000 , 1.2 * 1000],
// 'to, for  ל...': [25.650000000000002 * 1000 , 1.2 * 1000],
// 'no  לא': [27 * 1000 , 1.2 * 1000],
// 'slowly  לאט': [28.35 * 1000 , 1.2 * 1000],
// 'heart  לב': [29.700000000000003 * 1000 , 1.2 * 1000],
// 'alone  לבד': [31.05 * 1000 , 1.2 * 1000],
// 'white  לבן': [32.400000000000006 * 1000 , 1.2 * 1000],
// 'bless you (after s.o. sneezes)  לבריאות': [33.75 * 1000 , 1.2 * 1000],
// 'see you later  להתראות': [35.1 * 1000 , 1.2 * 1000],
// 'Cheers  לחיים': [36.45 * 1000 , 1.2 * 1000],
// 'bread  לחם': [37.800000000000004 * 1000 , 1.2 * 1000],
// 'lizard  לטאה': [39.150000000000006 * 1000 , 1.2 * 1000],
// 'night  לילה': [40.5 * 1000 , 1.2 * 1000],
// 'lemon  לימון': [41.85 * 1000 , 1.2 * 1000],
// 'why  למה': [43.2 * 1000 , 1.2 * 1000],
// 'down  למטה': [44.550000000000004 * 1000 , 1.2 * 1000],
// 'up  למעלה': [45.900000000000006 * 1000 , 1.2 * 1000],
// 'before  לפני': [47.25 * 1000 , 1.2 * 1000],
// 'from  מ...': [48.6 * 1000 , 1.2 * 1000],
// 'very  מאוד': [49.95 * 1000 , 1.2 * 1000],
// 'late  מאוחר': [51.300000000000004 * 1000 , 1.2 * 1000],
// 'pastry  מאפה': [52.650000000000006 * 1000 , 1.2 * 1000],
// 'bakery  מאפייה': [54 * 1000 , 1.2 * 1000],
// 'test/exam  מבחן': [55.35 * 1000 , 1.2 * 1000],
// 'towel  מגבת': [56.7 * 1000 , 1.2 * 1000],
// 'desert  מדבר': [58.050000000000004 * 1000 , 1.2 * 1000],
// 'country  מדינה': [59.400000000000006 * 1000 , 1.2 * 1000],
// 'scientist  מדען': [60.75000000000001 * 1000 , 1.2 * 1000],
// 'printer  מדפסת': [62.1 * 1000 , 1.2 * 1000],
// 'sidewalk  מדרכה': [63.45 * 1000 , 1.2 * 1000],
// 'what  מה': [64.80000000000001 * 1000 , 1.2 * 1000],
// 'fast  מהיר': [66.15 * 1000 , 1.2 * 1000],
// 'engineer  מהנדס': [67.5 * 1000 , 1.2 * 1000],
// 'quickly  מהר': [68.85000000000001 * 1000 , 1.2 * 1000],
// 'museum  מוזיאון': [70.2 * 1000 , 1.2 * 1000],
// 'music  מוזיקה': [71.55000000000001 * 1000 , 1.2 * 1000],
// 'brain  מוח': [72.9 * 1000 , 1.2 * 1000],
// 'ready  מוכן': [74.25 * 1000 , 1.2 * 1000],
// 'taxi  מונית': [75.60000000000001 * 1000 , 1.2 * 1000],
// 'early  מוקדם': [76.95 * 1000 , 1.2 * 1000],
// 'teacher  מורה': [78.30000000000001 * 1000 , 1.2 * 1000],
// 'weather  מזג אוויר': [79.65 * 1000 , 1.2 * 1000],
// 'air conditioner  מזגן': [81 * 1000 , 1.2 * 1000],
// 'fork  מזלג': [82.35000000000001 * 1000 , 1.2 * 1000],
// 'East  מזרח': [83.7 * 1000 , 1.2 * 1000],
// 'notebook  מחברת': [85.05000000000001 * 1000 , 1.2 * 1000],
// 'tomorrow  מחר': [86.4 * 1000 , 1.2 * 1000],
// 'computer  מחשב': [87.75 * 1000 , 1.2 * 1000],
// 'kitchen  מטבח': [89.10000000000001 * 1000 , 1.2 * 1000],
// 'fried  מטוגן': [90.45 * 1000 , 1.2 * 1000],
// 'airplane  מטוס': [91.80000000000001 * 1000 , 1.2 * 1000],
// 'meter  מטר': [93.15 * 1000 , 1.2 * 1000],
// 'who  מי': [94.5 * 1000 , 1.2 * 1000],
// 'bed  מיטה': [95.85000000000001 * 1000 , 1.2 * 1000],
// 'dictionary  מילון': [97.2 * 1000 , 1.2 * 1000],
// 'water  מים': [98.55000000000001 * 1000 , 1.2 * 1000],
// 'juice  מיץ': [99.9 * 1000 , 1.2 * 1000],
// 'microwave  מיקרוגל': [101.25 * 1000 , 1.2 * 1000],
// 'someone  מישהו': [102.60000000000001 * 1000 , 1.2 * 1000],
// 'car  מכונית': [103.95 * 1000 , 1.2 * 1000],
// 'ugly  מכוער': [105.30000000000001 * 1000 , 1.2 * 1000],
// 'pants  מכנסים': [106.65 * 1000 , 1.2 * 1000],
// 'shorts  מכנסים קצרים': [108 * 1000 , 1.2 * 1000],
// 'full  מלא': [109.35000000000001 * 1000 , 1.2 * 1000],
// 'exciting  מלהיב': [110.7 * 1000 , 1.2 * 1000],
// 'hotel  מלון': [112.05000000000001 * 1000 , 1.2 * 1000],
// 'salt  מלח': [113.4 * 1000 , 1.2 * 1000],
// 'cucumber  מלפפון': [114.75000000000001 * 1000 , 1.2 * 1000],
// 'government  ממשלה': [116.10000000000001 * 1000 , 1.2 * 1000],
// 'mango  מנגו': [117.45 * 1000 , 1.2 * 1000],
// 'serving/portion  מנה': [118.80000000000001 * 1000 , 1.2 * 1000],
// 'manager  מנהל': [120.15 * 1000 , 1.2 * 1000],
// 'tunnel  מנהרה': [121.50000000000001 * 1000 , 1.2 * 1000],
// 'restaurant  מסעדה': [122.85000000000001 * 1000 , 1.2 * 1000],
// 'number  מספר': [124.2 * 1000 , 1.2 * 1000],
// 'smelly  מסריח': [125.55000000000001 * 1000 , 1.2 * 1000],
// 'interesting  מעניין': [126.9 * 1000 , 1.2 * 1000],
// 'West  מערב': [128.25 * 1000 , 1.2 * 1000],
// 'napkin  מפית': [129.60000000000002 * 1000 , 1.2 * 1000],
// 'key  מפתח': [130.95000000000002 * 1000 , 1.2 * 1000],
// 'excellent  מצוין': [132.3 * 1000 , 1.2 * 1000],
// 'funny  מצחיק': [133.65 * 1000 , 1.2 * 1000],
// }, false);
// var sprite500_400 = addAudioSentances('500_words_301-400', 'sprite500_400', {
//   'camera  מצלמה': [0 * 1000 , 1.2 * 1000],
// 'place  מקום': [1.35 * 1000 , 1.2 * 1000],
// 'refrigerator  מקרר': [2.7 * 1000 , 1.2 * 1000],
// 'soup  מרק': [4.050000000000001 * 1000 , 1.2 * 1000],
// 'something  משהו': [5.4 * 1000 , 1.2 * 1000],
// 'game  משחק': [6.75 * 1000 , 1.2 * 1000],
// 'police  משטרה': [8.100000000000001 * 1000 , 1.2 * 1000],
// 'boring  משעמם': [9.450000000000001 * 1000 , 1.2 * 1000],
// 'family  משפחה': [10.8 * 1000 , 1.2 * 1000],
// 'weight  משקל': [12.15 * 1000 , 1.2 * 1000],
// 'office  משרד': [13.5 * 1000 , 1.2 * 1000],
// 'sweet  מתוק': [14.850000000000001 * 1000 , 1.2 * 1000],
// 'when  מתי': [16.200000000000003 * 1000 , 1.2 * 1000],
// 'intelligent  נבון': [17.55 * 1000 , 1.2 * 1000],
// 'driver  נהג': [18.900000000000002 * 1000 , 1.2 * 1000],
// 'river  נהר': [20.25 * 1000 , 1.2 * 1000],
// 'paper  נייר': [21.6 * 1000 , 1.2 * 1000],
// 'correct  נכון': [22.950000000000003 * 1000 , 1.2 * 1000],
// 'low  נמוך': [24.3 * 1000 , 1.2 * 1000],
// 'airport  נמל תעופה': [25.650000000000002 * 1000 , 1.2 * 1000],
// 'ant  נמלה': [27 * 1000 , 1.2 * 1000],
// 'shoes  נעליים': [28.35 * 1000 , 1.2 * 1000],
// 'nectarine  נקטרינה': [29.700000000000003 * 1000 , 1.2 * 1000],
// 'clean  נקי': [31.05 * 1000 , 1.2 * 1000],
// 'married  נשוי': [32.400000000000006 * 1000 , 1.2 * 1000],
// 'weapon  נשק': [33.75 * 1000 , 1.2 * 1000],
// 'grandfather  סבא': [35.1 * 1000 , 1.2 * 1000],
// 'soap  סבון': [36.45 * 1000 , 1.2 * 1000],
// 'grandmother  סבתא': [37.800000000000004 * 1000 , 1.2 * 1000],
// 'purple  סגול': [39.150000000000006 * 1000 , 1.2 * 1000],
// 'closed  סגור': [40.5 * 1000 , 1.2 * 1000],
// 'sheet  סדין': [41.85 * 1000 , 1.2 * 1000],
// 'sugar  סוכר': [43.2 * 1000 , 1.2 * 1000],
// 'end  סוף': [44.550000000000004 * 1000 , 1.2 * 1000],
// 'weekend  סוף שבוע': [45.900000000000006 * 1000 , 1.2 * 1000],
// 'supermarket  סופרמרקט': [47.25 * 1000 , 1.2 * 1000],
// 'student  סטודנט': [48.6 * 1000 , 1.2 * 1000],
// 'story  סיפור': [49.95 * 1000 , 1.2 * 1000],
// 'knife  סכין': [51.300000000000004 * 1000 , 1.2 * 1000],
// 'salad  סלט': [52.650000000000006 * 1000 , 1.2 * 1000],
// 'excuse me  סליחה': [54 * 1000 , 1.2 * 1000],
// 'beet(root)  סלק': [55.35 * 1000 , 1.2 * 1000],
// 'sandals  סנדלים': [56.7 * 1000 , 1.2 * 1000],
// 'sofa  ספה': [58.050000000000004 * 1000 , 1.2 * 1000],
// 'sport  ספורט': [59.400000000000006 * 1000 , 1.2 * 1000],
// 'book  ספר': [60.75000000000001 * 1000 , 1.2 * 1000],
// 'library  ספרייה': [62.1 * 1000 , 1.2 * 1000],
// 'movie  סרט': [63.45 * 1000 , 1.2 * 1000],
// 'Fall  סתיו': [64.80000000000001 * 1000 , 1.2 * 1000],
// 'past  עבר': [66.15 * 1000 , 1.2 * 1000],
// 'Hebrew  עברית': [67.5 * 1000 , 1.2 * 1000],
// 'tomato  עגבניה': [68.85000000000001 * 1000 , 1.2 * 1000],
// 'mold  עובש': [70.2 * 1000 , 1.2 * 1000],
// 'cake  עוגה': [71.55000000000001 * 1000 , 1.2 * 1000],
// 'world  עולם': [72.9 * 1000 , 1.2 * 1000],
// 'chicken  עוף': [74.25 * 1000 , 1.2 * 1000],
// 'pen  עט': [75.60000000000001 * 1000 , 1.2 * 1000],
// 'tired  עייף': [76.95 * 1000 , 1.2 * 1000],
// 'eye  עין': [78.30000000000001 * 1000 , 1.2 * 1000],
// 'city  עיר': [79.65 * 1000 , 1.2 * 1000],
// 'newspaper  עיתון': [81 * 1000 , 1.2 * 1000],
// 'spider  עכביש': [82.35000000000001 * 1000 , 1.2 * 1000],
// 'now  עכשיו': [83.7 * 1000 , 1.2 * 1000],
// 'on, about  על': [85.05000000000001 * 1000 , 1.2 * 1000],
// 'grapes  ענבים': [86.4 * 1000 , 1.2 * 1000],
// 'poor  עני': [87.75 * 1000 , 1.2 * 1000],
// 'cloud  ענן': [89.10000000000001 * 1000 , 1.2 * 1000],
// 'pencil  עפרון': [90.45 * 1000 , 1.2 * 1000],
// 'tree, wood  עץ': [91.80000000000001 * 1000 , 1.2 * 1000],
// 'stop  עצור': [93.15 * 1000 , 1.2 * 1000],
// 'lazy  עצלן': [94.5 * 1000 , 1.2 * 1000],
// 'bone  עצם': [95.85000000000001 * 1000 , 1.2 * 1000],
// 'evening  ערב': [97.2 * 1000 , 1.2 * 1000],
// 'Arabic  ערבית': [98.55000000000001 * 1000 , 1.2 * 1000],
// 'channel (tv)  ערוץ': [99.9 * 1000 , 1.2 * 1000],
// 'rich  עשיר': [101.25 * 1000 , 1.2 * 1000],
// 'future  עתיד': [102.60000000000001 * 1000 , 1.2 * 1000],
// 'mouth  פה': [103.95 * 1000 , 1.2 * 1000],
// 'here  פה': [105.30000000000001 * 1000 , 1.2 * 1000],
// 'garbage can  פח אשפה': [106.65 * 1000 , 1.2 * 1000],
// 'parsley  פטרוזיליה': [108 * 1000 , 1.2 * 1000],
// 'mushrooms  פטריות': [109.35000000000001 * 1000 , 1.2 * 1000],
// 'smart  פיקח': [110.7 * 1000 , 1.2 * 1000],
// 'pita  פיתה': [112.05000000000001 * 1000 , 1.2 * 1000],
// 'falafel  פלאפל': [113.4 * 1000 , 1.2 * 1000],
// 'pepper  פלפל': [114.75000000000001 * 1000 , 1.2 * 1000],
// 'face  פנים': [116.10000000000001 * 1000 , 1.2 * 1000],
// 'pasta  פסטה': [117.45 * 1000 , 1.2 * 1000],
// 'piano  פסנתר': [118.80000000000001 * 1000 , 1.2 * 1000],
// 'once  פעם': [120.15 * 1000 , 1.2 * 1000],
// 'twice  פעמים': [121.50000000000001 * 1000 , 1.2 * 1000],
// 'faculty  פקולטה': [122.85000000000001 * 1000 , 1.2 * 1000],
// 'fruit  פרי': [124.2 * 1000 , 1.2 * 1000],
// 'chapter  פרק': [125.55000000000001 * 1000 , 1.2 * 1000],
// 'simple  פשוט': [126.9 * 1000 , 1.2 * 1000],
// 'open  פתוח': [128.25 * 1000 , 1.2 * 1000],
// 'color  צבע': [129.60000000000002 * 1000 , 1.2 * 1000],
// 'I.D.F. (Israel Defense Forces)': [130.95000000000002 * 1000 , 1.2 * 1000],
// 'yellow  צהוב': [132.3 * 1000 , 1.2 * 1000],
// 'noon  צהריים': [133.65 * 1000 , 1.2 * 1000],
// }, false);

// var sprite500_500 = addAudioSentances('500_words_401-500', 'sprite500_500', {
//   'bird  ציפור': [0 * 1000 , 1.2 * 1000],
// 'plate  צלחת': [1.35 * 1000 , 1.2 * 1000],
// 'North  צפון': [2.7 * 1000 , 1.2 * 1000],
// 'team  קבוצה': [4.050000000000001 * 1000 , 1.2 * 1000],
// 'receipt  קבלה': [5.4 * 1000 , 1.2 * 1000],
// 'small  קטן': [6.75 * 1000 , 1.2 * 1000],
// 'quinoa  קינואה': [8.100000000000001 * 1000 , 1.2 * 1000],
// 'Summer  קיץ': [9.450000000000001 * 1000 , 1.2 * 1000],
// 'wall  קיר': [10.8 * 1000 , 1.2 * 1000],
// 'squash, zucchini  קישוא': [12.15 * 1000 , 1.2 * 1000],
// 'easy  קל': [13.5 * 1000 , 1.2 * 1000],
// 'mall  קניון': [14.850000000000001 * 1000 , 1.2 * 1000],
// 'bowl  קערה': [16.200000000000003 * 1000 , 1.2 * 1000],
// 'coffee  קפה': [17.55 * 1000 , 1.2 * 1000],
// 'a little  קצת': [18.900000000000002 * 1000 , 1.2 * 1000],
// 'cold  קר': [20.25 * 1000 , 1.2 * 1000],
// 'difficult  קשה': [21.6 * 1000 , 1.2 * 1000],
// 'head  ראש': [22.950000000000003 * 1000 , 1.2 * 1000],
// 'first  ראשון': [24.3 * 1000 , 1.2 * 1000],
// 'rabbi  רב': [25.650000000000002 * 1000 , 1.2 * 1000],
// 'quarter (of something)  רבע': [27 * 1000 , 1.2 * 1000],
// 'leg  רגל': [28.35 * 1000 , 1.2 * 1000],
// 'moment  רגע': [29.700000000000003 * 1000 , 1.2 * 1000],
// 'sauce  רוטב': [31.05 * 1000 , 1.2 * 1000],
// 'noisy  רועש': [32.400000000000006 * 1000 , 1.2 * 1000],
// 'doctor/physician  רופא': [33.75 * 1000 , 1.2 * 1000],
// 'thin  רזה': [35.1 * 1000 , 1.2 * 1000],
// 'street  רחוב': [36.45 * 1000 , 1.2 * 1000],
// 'wet  רטוב': [37.800000000000004 * 1000 , 1.2 * 1000],
// 'pomegranate  רימון': [39.150000000000006 * 1000 , 1.2 * 1000],
// 'soft  רך': [40.5 * 1000 , 1.2 * 1000],
// 'train  רכבת': [41.85 * 1000 , 1.2 * 1000],
// 'bad  רע': [43.2 * 1000 , 1.2 * 1000],
// 'hungry  רעב': [44.550000000000004 * 1000 , 1.2 * 1000],
// 'idea  רעיון': [45.900000000000006 * 1000 , 1.2 * 1000],
// 'floor  רצפה': [47.25 * 1000 , 1.2 * 1000],
// 'only  רק': [48.6 * 1000 , 1.2 * 1000],
// 'question  שאלה': [49.95 * 1000 , 1.2 * 1000],
// 'week  שבוע': [51.300000000000004 * 1000 , 1.2 * 1000],
// 'Saturday  שבת': [52.650000000000006 * 1000 , 1.2 * 1000],
// 'again  שוב': [54 * 1000 , 1.2 * 1000],
// 'shawarma  שווארמה': [55.35 * 1000 , 1.2 * 1000],
// 'table  שולחן': [56.7 * 1000 , 1.2 * 1000],
// 'garlic  שום': [58.050000000000004 * 1000 , 1.2 * 1000],
// 'hot chocolate  שוקו חם': [59.400000000000006 * 1000 , 1.2 * 1000],
// 'chocolate  שוקולד': [60.75000000000001 * 1000 , 1.2 * 1000],
// 'plum  שזיף': [62.1 * 1000 , 1.2 * 1000],
// 'black  שחור': [63.45 * 1000 , 1.2 * 1000],
// 'swimming  שחייה': [64.80000000000001 * 1000 , 1.2 * 1000],
// 'rug  שטיח': [66.15 * 1000 , 1.2 * 1000],
// 'teeth  שיניים': [67.5 * 1000 , 1.2 * 1000],
// 'lesson  שיעור': [68.85000000000001 * 1000 , 1.2 * 1000],
// 'shuttle taxi  שירות': [70.2 * 1000 , 1.2 * 1000],
// 'neighborhood  שכונה': [71.55000000000001 * 1000 , 1.2 * 1000],
// 'of  של': [72.9 * 1000 , 1.2 * 1000],
// 'hello  שלום': [74.25 * 1000 , 1.2 * 1000],
// 'third (of something)  שליש': [75.60000000000001 * 1000 , 1.2 * 1000],
// 'whole  שלם': [76.95 * 1000 , 1.2 * 1000],
// 'there  שם': [78.30000000000001 * 1000 , 1.2 * 1000],
// 'name  שם': [79.65 * 1000 , 1.2 * 1000],
// 'surname  שם משפחה': [81 * 1000 , 1.2 * 1000],
// 'first name  שם פרטי': [82.35000000000001 * 1000 , 1.2 * 1000],
// 'left (direction)  שמאלה': [83.7 * 1000 , 1.2 * 1000],
// 'sky  שמיים': [85.05000000000001 * 1000 , 1.2 * 1000],
// 'oil  שמן': [86.4 * 1000 , 1.2 * 1000],
// 'fat  שמן': [87.75 * 1000 , 1.2 * 1000],
// 'sun  שמש': [89.10000000000001 * 1000 , 1.2 * 1000],
// 'year  שנה': [90.45 * 1000 , 1.2 * 1000],
// 'second (time)  שניה': [91.80000000000001 * 1000 , 1.2 * 1000],
// 'schnitzel  שניצל': [93.15 * 1000 , 1.2 * 1000],
// 'hour  שעה': [94.5 * 1000 , 1.2 * 1000],
// 'clock  שעון': [95.85000000000001 * 1000 , 1.2 * 1000],
// 'goal (soccer)  שער': [97.2 * 1000 , 1.2 * 1000],
// 'hair  שער': [98.55000000000001 * 1000 , 1.2 * 1000],
// 'language  שפה': [99.9 * 1000 , 1.2 * 1000],
// 'almond  שקד': [101.25 * 1000 , 1.2 * 1000],
// 'quiet  שקט': [102.60000000000001 * 1000 , 1.2 * 1000],
// 'shekel  שקל': [103.95 * 1000 , 1.2 * 1000],
// 'shakshuka  שקשוקה': [105.30000000000001 * 1000 , 1.2 * 1000],
// 'toilet (bathroom)  שרותים': [106.65 * 1000 , 1.2 * 1000],
// '(a) drink  שתייה': [108 * 1000 , 1.2 * 1000],
// 'fig  תאנה': [109.35000000000001 * 1000 , 1.2 * 1000],
// 'date of birth  תאריך לידה': [110.7 * 1000 , 1.2 * 1000],
// 'tea  תה': [112.05000000000001 * 1000 , 1.2 * 1000],
// 'thank you  תודה': [113.4 * 1000 , 1.2 * 1000],
// 'strawberry  תות': [114.75000000000001 * 1000 , 1.2 * 1000],
// 'hobby  תחביב': [116.10000000000001 * 1000 , 1.2 * 1000],
// 'station, stop  תחנה': [117.45 * 1000 , 1.2 * 1000],
// 'baby  תינוק': [118.80000000000001 * 1000 , 1.2 * 1000],
// 'bag  תיק': [120.15 * 1000 , 1.2 * 1000],
// 'picture  תמונה': [121.50000000000001 * 1000 , 1.2 * 1000],
// 'date (food)  תמר': [122.85000000000001 * 1000 , 1.2 * 1000],
// 'traffic  תנועה': [124.2 * 1000 , 1.2 * 1000],
// 'oven  תנור': [125.55000000000001 * 1000 , 1.2 * 1000],
// 'orange (food)  תפוז': [126.9 * 1000 , 1.2 * 1000],
// 'apple  תפוח': [128.25 * 1000 , 1.2 * 1000],
// 'potato  תפוח אדמה': [129.60000000000002 * 1000 , 1.2 * 1000],
// 'ceiling  תקרה': [130.95000000000002 * 1000 , 1.2 * 1000],
// 'spinach  תרד': [132.3 * 1000 , 1.2 * 1000],
// 'answer  תשובה': [133.65 * 1000 , 1.2 * 1000],
// }, false);

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
function playAll500(sprits) {
  currentAudio?.sound?.unload();
  // shuffleArray(spritesArray);
  playSprits([sprits], 0, 2000);
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

setTimeout(() => {
  var selectedSprites = JSON.parse(localStorage.getItem('sprites'));
  document.querySelectorAll('.sprite').forEach((item, index) => {
    item.querySelector('input').checked = selectedSprites[item.id] || false;
    if (selectedSprites[item.id]) {
      item.classList.add('selected');
    }
  });
}, 50);


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function processWithDelay(spriteKey) {
  window[spriteKey]?.querySelector('.sprite-label')?.click();
  await sleep(5000);
}

async function playSelected1 () {
  var selectedCheckboxes = document.querySelectorAll('.sprite input[type="checkbox"]:checked');

  for (let i = 0; i < selectedCheckboxes.length; i++) {
    var spriteKey = selectedCheckboxes[i].getAttribute('data-sprite-key');

    await processWithDelay(spriteKey);
  }
}

async function playSelected () {
  var selectedCheckboxes = document.querySelectorAll('.sprite input[type="checkbox"]:checked');

  for (let i = 0; i < selectedCheckboxes.length; i++) {
    var spritesObj = selectedCheckboxes[i].getAttribute('data-sprites-obj');
    var spriteKey = selectedCheckboxes[i].getAttribute('data-sprite-key');

    await window[spritesObj]?.playSelected(spriteKey);
    await sleep(2000);

  }
}

// Function to scroll to a specific item
function scrollToItem(element) {
  // if (element) {
  //   element.scrollIntoView({ behavior: 'auto' });
  //   window.scrollBy(0, -500);
  // }

  if (element) {
    // Calculate the target position including the offset
    const targetPosition = element.offsetTop - 500;
  
    // Scroll to the target position with smooth behavior
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}
