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

Howler.usingWebAudio = true;
Howler.autoUnlock = true;
Howler.html5PoolSize=100; 


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
    // html5: true,
    loop: false,
    preload: true,
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
      
      const currentEl = document.querySelector('#' + key.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,|\||\!/g,'-'));
      
      currentEl?.querySelector('.sprite-label')?.addEventListener('click', function(e) {
        self.play(key);
        self._currentPlayingEl = e.target;
      }, false);

      // currentEl?.querySelector('.keep-repeating')?.addEventListener('click', function(e) {
      //   self.play(key);
      //   self._currentPlayingEl = e.target;
      // }, false);
      
      currentEl?.querySelector('label')?.addEventListener('click', function(e) {
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
      var currentPlayingId = Object.keys(self._spriteMap)[index]?.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,|\||\!/g,'-');
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
            Sprite.CurrentTimerId = setTimeout(() => {
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
            Sprite.CurrentTimerId = setTimeout(() => {
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
      </label><div class="sprite-label">${offset + index + 1}. ${sprite[key]}</div><label style="display: none;"><input data-sprite-key="${key}" data-sprites-obj="${spriteObjName}" type="checkbox">
      </label>`;
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

function addAudioSentances(name, spriteObjName, sentences, addToArray = true, rate = 1) {
  var spriteMap = {};
  Object.keys(sentences).forEach((key, index) => {
    var sprit = document.createElement('div');
    sprit.setAttribute('id', key.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,|\||\!/g,'-'));
    sprit.setAttribute('class', 'sprite');
    sprit.innerHTML = `<label><input data-sprite-key="${key}" data-sprites-obj="${spriteObjName}" type="checkbox">
    </label><div class="sprite-label">[${sentanceIndex++}] ${key}</div><label><input class="keep-repeating" data-sprite-key="${key}" data-sprites-obj="${spriteObjName}" type="checkbox">
    </label>`;
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
  if (newSprite?.sound?.rate && rate) {
    debugger
    newSprite.sound.rate(rate);
  }

  return newSprite;
}
function addAudio (name, spriteObjName, label, time = 1) {
  var sprit = document.createElement('div');
  sprit.setAttribute('id', name.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,|\||\!/g,'-'));
  sprit.setAttribute('class', 'sprite');
  sprit.innerHTML = `<label><input data-sprite-key="${name}" data-sprites-obj="${spriteObjName}" type="checkbox">
  </label><div class="sprite-label">[${sentanceIndex++}] ${label || name}</div><label style="display: none;"><input data-sprite-key="${name}" data-sprites-obj="${spriteObjName}" type="checkbox">
  </label>`;
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


var sprite_30 = addAudioSentances('can not ask them to die for nothing', 'sprite_30', {
  'can not ask them to die for nothing | אני לא יכל לבקש מהם למות לשוא': [0, 2.49 * 1000],
});

var sprite_31 = addAudioSentances('another pillow', 'sprite_31', {
  'I am sure you will be able to get another pillow | אני בטוחה שתוכלו להשיג כרית אחרת.': [0, 2.49 * 1000],
});
var sprite_32 = addAudioSentances('we are focusing', 'sprite_32', {
  'we are focusing (on) | אנחנו מתמקדים': [0, 2.49 * 1000],
});
var sprite_33 = addAudioSentances('not ready to live like this', 'sprite_33', {
  'not ready to live like this | לא מוכן ככה להמשיך לחיות': [0, 2.49 * 1000],
});
var sprite_34 = addAudioSentances('amazing', 'sprite_34', {
  'amazing | מדהים מדהים מדהים!': [0, 2.49 * 1000],
});


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
}, true, 1.3);
var sprite_28 = addAudioSentances('are you rich', 'sprite_28', {
  'are you rich אתה עשיר': [0 * 1000, 2.5 * 1000],
}, true, 1.3);
var sprite_29 = addAudioSentances('i am broke', 'sprite_29', {
  'I am broke אני מרושש': [0 * 1000, 2 * 1000],
}, true, 1.3);
var sprite_59 = addAudioSentances('i am debet', 'sprite_59', {
  'i am debet | אני בחוב': [0 * 1000, 2 * 1000],
}, true, 1.3);
var sprite_60 = addAudioSentances('do you have money', 'sprite_60', {
  'do you have money | יש לך כסף': [0 * 1000, 2 * 1000],
}, true, 1.3);
var sprite_61 = addAudioSentances('i wanna be rich', 'sprite_61', {
  'i wanna be rich | אני רוצה להיות עשיר': [0 * 1000, 2 * 1000],
}, true, 1.3);
var sprite_62 = addAudioSentances('i do not have cash', 'sprite_62', {
  'i do not have cash | אין לי כסף מזומן': [0 * 1000, 2 * 1000],
}, true, 1.3);
var sprite_63 = addAudioSentances('how much i owe you', 'sprite_63', {
  'how much i owe you | כמה אני חייב לך': [0 * 1000, 2 * 1000],
}, true, 1.3);
var sprite_64 = addAudioSentances('you are paying today', 'sprite_64', {
  'you are paying today | אתה משלם היום': [0 * 1000, 2 * 1000],
}, true, 1.3);
var sprite_65 = addAudioSentances('do not trust him', 'sprite_65', {
  'do not trust him | אל תסמכו עליו': [0 * 1000, 2 * 1000],
}, true, 1.1);

sentanceIndex = 1;
var sprite500_100 = addAudioSentances('500_words_1-100', 'sprite500_100', {
  'dad a-ba אבא': [0 * 1000, 0.8 * 1000],
  'watermelon a-va-ti-akh אבטיח': [1 * 1000, 1.2 * 1000],
  'Spring a-viv אביב': [2.4 * 1000, 1.2 * 1000],
  'but a-val אבל': [3.7 * 1000, 1.2 * 1000],
  'thumb a-gu-dal אגודל': [5 * 1000, 1.2 * 1000],
  'walnut e-goz me-lekh אגוז מלך': [6.7 * 1000, 1.2 * 1000],
  'pear a-gas אגס': [8.3 * 1000, 1.2 * 1000],
  'red a-dom אדום': [9.5 * 1000, 1.2 * 1000],
  'or o או': [10.8 * 1000, 1.2 * 1000],
  'ear o-zen אוזן': [12.15 * 1000, 1.2 * 1000],
  'bus o-to-bus אוטובוס': [13.5 * 1000, 1.2 * 1000],
  'food o-khel אוכל': [15 * 1000, 1.2 * 1000],
  'maybe u-lai אולי': [16.3 * 1000, 1.2 * 1000],
  'university u-ni-ver-si-ta אוניברסיטה': [17.9 * 1000, 1.2 * 1000],
  'bicycle o-fa-na-yim אופניים': [19.5 * 1000, 1.2 * 1000],
  'rice o-rez אורז': [20.9 * 1000, 1.2 * 1000],
  'so, then az אז': [22.2 * 1000, 1.2 * 1000],
  'brother akh אח': [23.4 * 1000, 1.2 * 1000],
  'sister a-khot אחות': [24.6 * 1000, 1.2 * 1000],
  'last, final a-kha-ron אחרון': [25.7 * 1000, 1.2 * 1000],
  'which ei-ze איזה': [27 * 1000, 1.2 * 1000],
  'slow i-ti איטי': [28.35 * 1000, 1.2 * 1000],
  'how eikh איך': [29.7 * 1000, 1.2 * 1000],
  'mom i-ma אימא': [31 * 1000, 1 * 1000],
  'there isn’t/aren’t ein אין': [32 * 1000, 1.15 * 1000],
  'where ei-fo איפה': [33.3 * 1000, 1 * 1000],
  'wife i-sha אישה': [34.5 * 1000, 1 * 1000],
  'if im אם': [35.8 * 1000, 1 * 1000],
  'English an-glit אנגלית': [37 * 1000, 1 * 1000],
  'we a-nakh-nu אנחנו': [38.4 * 1000, 1.2 * 1000],
  'I a-ni אני': [39.6 * 1000, 1.2 * 1000],
  'pineapple a-na-nas אננס': [41 * 1000, 1 * 1000],
  'forbidden a-sur אסור': [42.4 * 1000, 1.2 * 1000],
  'nose af אף': [43.75 * 1000, 1 * 1000],
  'peach a-far-sek אפרסק': [45.22 * 1000, 1.1 * 1000],
  '(it is) possible ef-shar אפשר': [46.6 * 1000, 1 * 1000],
  'finger, toe ets-ba אצבע': [48.2 * 1000, 1 * 1000],
  'breakfast a-ru-khat bo-ker ארוחת בוקר': [49.5 * 1000, 1.3 * 1000],
  'dinner a-ru-khat e-rev ארוחת ערב': [51.2 * 1000, 1.2 * 1000],
  'lunch a-ru-khat tso-ho-ra-yim ארוחת צהריים': [53 * 1000, 1.3 * 1000],
  'wallet ar-nak ארנק': [54.8 * 1000, 1 * 1000],
  'grapefruit esh-ko-lit אשכולית': [56.25 * 1000, 1.1 * 1000],
  'you (f.) at את': [57.5 * 1000, 1 * 1000],
  'you (m.) a-ta אתה': [58.9 * 1000, 1 * 1000],
  'you (m.p.) a-tem אתם': [60.1 * 1000, 1 * 1000],
  'yesterday et-mol אתמול': [61.45 * 1000, 1.1 * 1000],
  'you (f.p.) a-ten אתן': [62.7 * 1000, 1 * 1000],
  'in, at be, ba ב...': [64 * 1000, 2.1 * 1000],

  'please be-va-ka-sha בבקשה': [66.4 * 1000, 1.2 * 1000],
  'clothes be-ga-dim בגדים': [67.8 * 1000, 1.2 * 1000],
  'good luck be-hats-la-kha בהצלחה': [69.25 * 1000, 1.2 * 1000],
  'morning bo-ker בוקר': [70.7 * 1000, 1.2 * 1000],
  'outside ba-khuts בחוץ': [72.2 * 1000, 1.2 * 1000],
  'sweet potato ba-ta-ta בטטה': [73.5 * 1000, 1.2 * 1000],

  'stomach/abdomen/tummy be-ten בטן': [75 * 1000, 1.2 * 1000], 
  'together be-ya-khad ביחד': [76.2 * 1000, 1.2 * 1000], 
  'medium bei-no-ni בינוני': [77.7 * 1000, 1.2 * 1000], 
  'egg bei-tsa ביצה': [79 * 1000, 1.1 * 1000], 
  'beer bi-ra בירה': [80.2 * 1000, 1.1 * 1000], 
  'house ba-yit בית': [81.5 * 1000, 1.1 * 1000], 
  'hospital beit kho-lim בית חולים': [82.8 * 1000, 1.1 * 1000], 
  'synagogue beit kne-set בית כנסת': [84 * 1000, 1.1 * 1000], 
  'pharmacy beit mir-ka-khat בית מרקחת': [85.6 * 1000, 1.1 * 1000], 
  'school beit se-fer בית ספר': [87.2 * 1000, 1.1 * 1000], 
  'without bli בלי': [88.5 * 1000, 1.1 * 1000], 
  'son ben בן': [89.7 * 1000, 1.1 * 1000], 
  'cousin ben dod בן דוד': [90.9 * 1000, 1.1 * 1000], 
  'gasoline ben-zin בנזין': [92.28 * 1000, 1.1 * 1000], 
  'building bin-yan בניין': [93.5 * 1000, 1.1 * 1000], 
  'banana ba-na-na בננה': [94.85 * 1000, 1.1 * 1000], 
  'bank bank בנק': [96.25 * 1000, 1.1 * 1000], 

  'okay be-se-der בסדר': [97.6 * 1000, 1.1 * 1000], 
  'husband ba-al בעל': [99 * 1000, 1.1 * 1000], 
  'inside bif-nim בפנים': [100.4 * 1000, 1.1 * 1000], 
  'onion ba-tsal בצל': [101.75 * 1000, 1.1 * 1000], 
  'bottle bak-buk בקבוק': [103 * 1000, 1.1 * 1000], 
  'beef ba-kar בקר': [104.4 * 1000, 1.1 * 1000], 
  'soon be-ka-rov בקרוב': [105.8 * 1000, 1.1 * 1000], 
  'healthy ba-ri בריא': [107 * 1000, 1.1 * 1000], 
  'meat ba-sar בשר': [108.3 * 1000, 1.1 * 1000], 
  'daughter bat בת': [109.7 * 1000, 1.1 * 1000], 
  'cockroach juk ג\'וק': [110.9 * 1000, 1 * 1000], 
  'back gav גב': [112.4 * 1000, 1 * 1000], 
  'high ga-vo-ha גבוה': [113.5 * 1000, 1 * 1000], 
  'cheese gvi-na גבינה': [114.9 * 1000, 1 * 1000], 
  'big ga-dol גדול': [116.1 * 1000, 1 * 1000], 
  'height go-va גובה': [117.4 * 1000, 1 * 1000], 
  'body guf גוף': [118.9 * 1000, 1 * 1000], 
  'carrot ge-zer גזר': [120 * 1000, 1 * 1000],

  'ice cream gli-da גלידה': [121.33 * 1000, 1 * 1000],
  'also gam גם': [122.6 * 1000, 1 * 1000],
  'socks gar-ba-yim גרביים': [123.73 * 1000, 1 * 1000],
  'rain ge-shem גשם': [125.15 * 1000, 1.1 * 1000],
  'honey dvash דבש': [126.2 * 1000, 1 * 1000],
  'fish dag דג': [127.3 * 1000, 1 * 1000],
  'mail; post office do-ar דואר': [128.6 * 1000, 1 * 1000],
  'cherry duv-de-van דובדבן': [129.8 * 1000, 1.1 * 1000],
  'uncle dod דוד': [131.2 * 1000, 1.1 * 1000],
  'aunt do-da דודה': [132.6 * 1000, 1.1 * 1000],
  'apartment di-ra': [133.7 * 1000, 1.1 * 1000],
}, false);
var sprite500_200 = addAudioSentances('500_words_101-200', 'sprite500_200', {
  'door  דלת': [0 * 1000 , 1 * 1000],
  'minute  דקה': [1.3 * 1000 , 1 * 1000],
  'South  דרום': [2.45 * 1000 , 1 * 1000],
  'passport  דרכון': [3.8 * 1000 , 1 * 1000],
  'religious  דתי': [5 * 1000 , 1 * 1000],
  'the  ה...': [6.2 * 1000 , 1 * 1000],
  'next  הבא': [7.47 * 1000 , 1 * 1000],
  'he  הוא': [8.7 * 1000 , 1 * 1000],
  'turkey (animal)  ho-du  הודו': [9.8 * 1000 , 1 * 1000],
  'present (tense)  ho-ve  הווה': [11 * 1000 , 1 * 1000],
  'parents  ho-rim  הורים': [12.35 * 1000 , 1 * 1000],
  'she  hi  היא': [13.62 * 1000 , 1 * 1000],
  'today  ha-yom  היום': [14.65 * 1000 , 1 * 1000],
  'they (m.)  hem  הם': [16 * 1000 , 1 * 1000],
  'they (f.)  hen  הן': [17 * 1000 , 1 * 1000],
  'break  haf-sa-ka  הפסקה': [18.2 * 1000 , 1 * 1000],
  'a lot  har-be  הרבה': [19.5 * 1000 , 1 * 1000],
  'exercise  hit-am-lut  התעמלות': [21.14 * 1000 , 1 * 1000],
  'and  ve  ו...': [22.37 * 1000 , 1 * 1000],
  'this  ze  זה': [23.6 * 1000 , 1 * 1000],
  'cheap  zol  זול': [24.77 * 1000 , 1 * 1000],
  'olive  za-yit  זית': [26.14 * 1000 , 1.1 * 1000],
  'time  zman  זמן': [27.5 * 1000 , 1.1 * 1000],
  
  'old (person)  za-ken  זקן': [28.9 * 1000 , 1.1 * 1000],
  'friend  kha-ver  חבר': [30.3 * 1000 , 1 * 1000],
  'company  khev-ra  חברה': [31.7 * 1000 , 1 * 1000],
  'holiday  khag  חג': [33 * 1000 , 1 * 1000],
  'belt  kha-go-ra  חגורה': [34.12 * 1000 , 1 * 1000],
  'room  khe-der  חדר': [35.36 * 1000 , 1 * 1000],
  'new  kha-dash  חדש': [36.70 * 1000 , 1 * 1000],
  'news  kha-da-shot  חדשות': [38 * 1000 , 1 * 1000],
  'month  kho-desh  חודש': [39.27 * 1000 , 1 * 1000],
  'sick  kho-le  חולה': [40.5 * 1000 , 1 * 1000],
  'shirt  khul-tsa  חולצה': [41.85 * 1000 , 1 * 1000],
  'brown  khum  חום': [43.16 * 1000 , 1 * 1000],
  'hummus  khu-mus  חומוס': [44.45 * 1000 , 0.003 * 1000],
  'beach  khof  חוף': [45.8 * 1000 , 1 * 1000],
  'vacation  khuf-sha  חופשה': [47.15 * 1000 , 1 * 1000],
  'Winter  kho-ref  חורף': [48.5 * 1000 , 1 * 1000],
  'chest  kha-ze  חזה': [50 * 1000 , 1 * 1000],
  'strong  kha-zak  חזק': [51.45 * 1000 , 1 * 1000],
  'milk  kha-lav  חלב': [52.80 * 1000 , 1 * 1000],
  'challah  kha-la  חלה': [54 * 1000 , 1 * 1000],
  'window  kha-lon  חלון': [55.34 * 1000 , 1 * 1000],
  'secular  khi-lo-ni  חלוני': [56.65 * 1000 , 1 * 1000],
  'hot  kham  חם': [58.14 * 1000 , 1 * 1000],
  'butter  khem-a  חמאה': [59.5 * 1000 , 1 * 1000],
  'pickles  kha-mu-tsim  חמוצים': [61 * 1000 , 1 * 1000],
  'store  kha-nut  חנות': [62.5 * 1000 , 1 * 1000],

  'lettuce  kha-sa  חסה': [63.8 * 1000 , 1 * 1000],
  'skirt  kha-tsa-it  חצאית': [65.16 * 1000 , 1 * 1000],
  'half (of something)  khe-tsi  חצי': [66.7 * 1000 , 1 * 1000],

  'spicy (hot)  kha-rif  חריף': [68 * 1000 , 1 * 1000],
  'bill check  khesh-bon  חשבון': [69.5 * 1000 , 1 * 1000],
  'important  kha-shuv  חשוב': [71 * 1000 , 1 * 1000],
  'cat  kha-tul  חתול': [72.35 * 1000 , 1 * 1000],
  'good  tov  טוב': [73.6 * 1000 , 1 * 1000],

  'trip hike  ti-yul  טיול': [74.9 * 1000 , 1 * 1000],
  'lamb  ta-le  טלה': [76 * 1000 , 1 * 1000],
  'tv  te-le-viz-ya  טלוויזיה': [77.34 * 1000 , 1 * 1000],
  'telephone  te-le-fon  טלפון': [78.6 * 1000 , 1 * 1000],

  'tasty  ta-im  טעים': [79.69 * 1000 , 1.1 * 1000],
  'get going  ya-la  יאללה': [81 * 1000 , 1 * 1000],
  'arm  yad  יד': [82.22 * 1000 , 1 * 1000],
  'Jewish  ye-hu-di  יהודי': [83.35 * 1000 , 1 * 1000],
  'yogurt  yo-gurt  יוגורט': [84.70 * 1000 , 1 * 1000],
  'day  yom  יום': [85.8 * 1000 , 1 * 1000],
  'Sunday  yom ri-shon  יום ראשון': [88.6 * 1000 , 1 * 1000],
  'Monday  yom she-ni  יום שני': [92.7 * 1000 , 1 * 1000],
  'Tuesday  yom shli-shi  יום שלישי': [91.4 * 1000 , 1 * 1000],
  'Wednesday  yom re-vi-i  יום רביעי': [89.9 * 1000 , 1 * 1000],
  'Thursday  yom kha-mi-shi  יום חמישי': [87.3 * 1000 , 1 * 1000],
  'Friday  yom shi-shi  יום שישי': [94 * 1000 , 1 * 1000],
  'singular; single (not married)  ya-khid  יחיד': [95.48 * 1000 , 1 * 1000],
  'wine  ya-yin  יין': [96.67 * 1000 , 1 * 1000],
  'boy  ye-led  ילד': [97.6 * 1000 , 1 * 1000],
  'girl  yal-da  ילדה': [98.9 * 1000 , 1 * 1000],
  'sea  yam  ים': [100.15 * 1000 , 1 * 1000],

  'right (direction)  ya-mi-na  ימינה': [101.34 * 1000 , 1 * 1000],
  'beautiful  ya-fe  יפה': [102.7 * 1000 , 1 * 1000],
  'exit  ye-tsi-a  יציאה': [104.1 * 1000 , 1 * 1000],
  'expensive  ya-kar  יקר': [105.5 * 1000 , 1 * 1000],
  'green  ya-rok  ירוק': [106.83 * 1000 , 1 * 1000],
  'moon  ya-re-akh  ירח': [108.32 * 1000 , 1 * 1000],
  'vegetables  ye-ra-kot  ירקות': [109.88 * 1000 , 1 * 1000],

  'there is/are  yesh  יש': [111.12 * 1000 , 1 * 1000],
  'old (thing)  ya-shan  ישן': [112.46 * 1000 , 1 * 1000],
  'straight ahead; honest  ya-shar  ישר': [113.75 * 1000 , 1 * 1000],
  'Israel  is-ra-el  ישראל': [115.26 * 1000 , 0.001 * 1000],
  'mosquito  ya-tush  יתוש': [116.78 * 1000 , 1 * 1000],
  'as  ke  כ...': [118.28 * 1000 , 1 * 1000],
  'pain/ache  ke-ev  כאב': [119.72 * 1000 , 1 * 1000],
  'road, route  kvish  כביש': [120.88 * 1000 , 1 * 1000],

  'ball  ka-dur  כדור': [122.14 * 1000 , 1 * 1000],
  'soccer  ka-du-re-gel  כדורגל': [123.25 * 1000 , 1 * 1000],
  'basketball  ka-dur-sal  כדורסל': [124.85 * 1000 , 1 * 1000],

  'hat  ko-va  כובע': [126.46 * 1000 , 1 * 1000],
  'star  ko-khav  כוכב': [127.78 * 1000 , 1 * 1000],
  'glass, cup  kos  כוס': [129.14 * 1000 , 1 * 1000],
  'angry  ko-es  כועס': [130.35 * 1000 , 1 * 1000],
}, false);


var sprite500_300 = addAudioSentances('500_words_201-300', 'sprite500_300', {
  'blue | ka-khol | כחול': [0.00 * 1000 , 1 * 1000],
  'chair | ki-se | כיסא': [1.12 * 1000 , 1 * 1000],
  'classroom | ki-ta | כיתה': [2.30 * 1000 , 1 * 1000],
  'all | kol | כל': [3.5 * 1000 , 1 * 1000],
  'dog | ke-lev | כלב': [4.78 * 1000 , 1 * 1000],
  'nothing | klum | כלום': [6 * 1000 , 1 * 1000],
  'how much | ka-ma (or ka-ma) | כמה': [7.33 * 1000 , 1 * 1000],
  'yes | ken | כן': [8.63 * 1000 , 1 * 1000],
  'entrance | kni-sa | כניסה': [10 * 1000 , 1 * 1000],
  'money | ke-sef | כסף': [11.25 * 1000 , 1 * 1000],
  'ATM | kas-po-mat | כספומט': [12.6 * 1000 , 1 * 1000],
  'spoon | kaf | כף': [14.1 * 1000 , 1 * 1000],
  'hand | kaf yad | כף יד': [15.53 * 1000 , 1 * 1000],
  'foot | kaf re-gel | כף רגל': [16.9 * 1000 , 1 * 1000],
  'cabbage | kruv | כרוב': [18.5 * 1000 , 1 * 1000],
  'pillow | ka-rit | כרית': [20 * 1000 , 1 * 1000],
  'kosher | ka-sher | כשר': [21.4 * 1000 , 1 * 1000],
  'address | ktov-et | כתובת': [22.7 * 1000 , 1 * 1000],
  'orange (color) | ka-tom | כתום': [23.9 * 1000 , 1 * 1000],
  'to, for | le | ל...': [25.4 * 1000 , 1 * 1000],
  'no | lo | לא': [26.65 * 1000 , 1 * 1000],
  'slowly | le-at | לאט': [27.9 * 1000 , 1 * 1000],
  'heart | lev | לב': [29.1 * 1000 , 1 * 1000],
  'alone | le-vad | לבד': [30.30 * 1000 , 1 * 1000],
  'white | la-van | לבן': [31.5 * 1000 , 1 * 1000],
  'bless you (after s.o. sneezes) | liv-ri-ut | לבריאות': [32.95 * 1000 , 1 * 1000],
  'see you later | le-hit-ra-ot | להתראות': [34.6 * 1000 , 1 * 1000],
  'Cheers! | le-kha-yim | לחיים!': [36.1 * 1000 , 1 * 1000],
  'bread | le-khem | לחם': [37.46 * 1000 , 1 * 1000],
  'lizard | le-ta-a | לטאה': [38.7 * 1000 , 1 * 1000],
  'night | lai-la | לילה': [40 * 1000 , 0.8 * 1000],
  'lemon | li-mon | לימון': [41.3 * 1000 , 1 * 1000],
  'why | la-ma | למה': [42.7 * 1000 , 1 * 1000],
  'down | le-ma-ta | למטה': [44.13 * 1000 , 1 * 1000],
  'up | le-ma-la | למעלה': [45.40 * 1000 , 1 * 1000],
  'before | lif-nei | לפני': [46.7 * 1000 , 1 * 1000],
  'from | me | מ...': [47.9 * 1000 , 1 * 1000],
  'very | me-od | מאוד': [49.1 * 1000 , 1 * 1000],
  'late | me-u-khar | מאוחר': [50.38 * 1000 , 1 * 1000],
  'pastry | ma-a-fe | מאפה': [51.65 * 1000 , 1 * 1000],
  'bakery | ma-a-fi-ya | מאפייה': [52.85 * 1000 , 1 * 1000],
  'test/exam | miv-khan | מבחן': [54.25 * 1000 , 1 * 1000],
  'towel | ma-ge-vet | מגבת': [55.57 * 1000 , 1 * 1000],
  'desert | mid-bar | מדבר': [57.2 * 1000 , 1 * 1000],
  'country | me-di-na | מדינה': [58.60 * 1000 , 1 * 1000],
  'scientist | mad-an | מדען': [59.83 * 1000 , 1 * 1000],
  'printer | mad-pe-set | מדפסת': [61.13 * 1000 , 1 * 1000],
  'sidewalk | mid-ra-kha | מדרכה': [62.65 * 1000 , 1 * 1000],
  'what | ma | מה': [64.16 * 1000 , 1 * 1000],
  'fast | ma-hir | מהיר': [65.50 * 1000 , 1 * 1000],
  'engineer | me-han-des | מהנדס': [66.85 * 1000 , 1 * 1000],
  'quickly | ma-her | מהר': [68.25 * 1000 , 1 * 1000],
  'museum | mu-zei-on | מוזיאון': [69.60 * 1000 , 1 * 1000],
  'music | mu-zi-ka | מוזיקה': [71 * 1000 , 1 * 1000],
  'brain | mo-akh | מוח': [72.30 * 1000 , 1 * 1000],
  'ready | mu-khan | מוכן': [73.5 * 1000 , 1 * 1000],
  'taxi | mo-nit | מונית': [74.70 * 1000 , 1 * 1000],
  'early | muk-dam | מוקדם': [76 * 1000 , 1 * 1000],
  'teacher | mo-re, mo-ra | מורה': [77.32 * 1000 , 2.14 * 1000],
  'weather | me-zeg a-vir | מזג אוויר': [79.9 * 1000 , 1 * 1000],
  'air conditioner | maz-gan | מזגן': [81.5 * 1000 , 1 * 1000],
  'fork | maz-leg | מזלג': [82.95 * 1000 , 1 * 1000],
  'East | miz-rakh | מזרח': [84.4 * 1000 , 1 * 1000],
  'notebook | makh-be-ret | מחברת': [85.8 * 1000 , 1 * 1000],
  'tomorrow | ma-khar | מחר': [87.2 * 1000 , 1 * 1000],
  'computer | makh-shev | מחשב': [88.75 * 1000 , 1 * 1000],
  'kitchen | mit-bakh | מטבח': [89.98 * 1000 , 1 * 1000],
  'fried | me-tu-gan | מטוגן': [91.45 * 1000 , 1 * 1000],
  'airplane | ma-tos | מטוס': [92.9 * 1000 , 1 * 1000],
  'meter | me-ter | מטר': [94.24  * 1000 , 1 * 1000],
  'who | mi | מי': [95.34  * 1000 , 1 * 1000],
  'bed | mi-ta | מיטה': [96.5  * 1000 , 1 * 1000],
  'dictionary | mi-lon | מילון': [97.6  * 1000 , 1 * 1000],
  'water | ma-yim | מים': [98.9 * 1000 , 1 * 1000],
  'juice | mits | מיץ': [100.1 * 1000 , 1 * 1000],
  'microwave | mik-ro-gal | מיקרוגל': [101.2 * 1000 , 1 * 1000],
  'someone | mi-she-hu | מישהו': [102.75 * 1000 , 1 * 1000],
  'car | me-kho-nit | מכונית': [104.2 * 1000 , 1 * 1000],
  'ugly | me-kho-ar | מכוער': [105.30 * 1000 , 1 * 1000],
  'pants | mikh-na-sa-yim | מכנסים': [106.65 * 1000 , 1 * 1000],
  'shorts | mikh-na-sa-yim k-tsar-im | מכנסים קצרים': [108.19 * 1000 , 1.2 * 1000],
  'full | ma-le | מלא': [109.74 * 1000 , 1 * 1000],
  'exciting | mal-hiv | מלהיב': [110.9 * 1000 , 1 * 1000],
  'hotel | ma-lon | מלון': [112.30 * 1000 , 1 * 1000],
  'salt | me-lakh | מלח': [113.8 * 1000 , 1 * 1000],
  'cucumber | me-la-fe-fon | מלפפון': [115.26 * 1000 , 1 * 1000],
  'government | mem-sha-la | ממשלה': [116.75 * 1000 , 1 * 1000],
  'mango | man-go | מנגו': [118 * 1000 , 1 * 1000],
  'serving/portion | ma-na | מנה': [119.20 * 1000 , 1 * 1000],
  'manager | me-na-hel | מנהל': [120.56 * 1000 , 1 * 1000],
  'tunnel | min-ha-ra | מנהרה': [121.9 * 1000 , 1 * 1000],
  'restaurant | mis-a-da | מסעדה': [123.25 * 1000 , 1 * 1000],
  'number | mis-par | מספר': [124.58 * 1000 , 1 * 1000],
  'smelly | mas-ri-akh | מסריח': [125.85 * 1000 , 1 * 1000],
  'interesting | me-an-yen | מעניין': [127.22 * 1000 , 1 * 1000],
  'West | ma-a-rav | מערב': [128.6 * 1000 , 1 * 1000],
  'napkin | map-it | מפית': [129.8 * 1000 , 1 * 1000],
  'key | maf-te-akh | מפתח': [131 * 1000 , 1 * 1000],
  'excellent | me-tsu-yan | מצוין': [132.43 * 1000 , 1 * 1000],
  'funny | mats-khik | מצחיק': [133.9 * 1000 , 1 * 1000],
}, false);
var sprite500_400 = addAudioSentances('500_words_301-400', 'sprite500_400', {
  'camera | mats-le-ma | מצלמה': [0.13 * 1000 , 1 * 1000],
  'place | ma-kom | מקום': [1.43 * 1000 , 1 * 1000],
  'refrigerator | me-ka-rer | מקרר': [2.9 * 1000 , 1 * 1000],
  'soup | ma-rak | מרק': [4.35 * 1000 , 1 * 1000],
  'something | ma-she-hu | משהו': [5.88 * 1000 , 1 * 1000],
  'game | mis-khak | משחק': [7.33 * 1000 , 1 * 1000],
  'police | mish-ta-ra | משטרה': [8.77 * 1000 , 1 * 1000],
  'boring | me-sha-a-mem | משעמם': [10.3 * 1000 , 1 * 1000],
  'family | mish-pa-kha | משפחה': [11.85 * 1000 , 1 * 1000],
  'weight | mish-kal | משקל': [13.3 * 1000 , 1 * 1000],
  'office | mis-rad | משרד': [14.9 * 1000 , 1 * 1000],
  'sweet | ma-tok | מתוק': [16.34 * 1000 , 1 * 1000],
  'when | ma-tai | מתי': [17.68 * 1000 , 1 * 1000],
  'intelligent | na-von | נבון': [19.16 * 1000 , 1 * 1000],
  'driver | na-hag | נהג': [20.58 * 1000 , 1 * 1000],
  'river | na-har | נהר': [22 * 1000 , 1 * 1000],
  'paper | ni-yar | נייר': [23.46 * 1000 , 1 * 1000],
  'correct | na-khon | נכון': [24.8 * 1000 , 1 * 1000],
  'low | na-mukh | נמוך': [26.2 * 1000 , 1 * 1000],
  'airport | na-mal te-u-fa | נמל תעופה': [27.8 * 1000 , 1 * 1000],
  'ant | ne-ma-la | נמלה': [29.4 * 1000 , 1 * 1000],
  'shoes | na-a-la-yim | נעליים': [30.85 * 1000 , 1 * 1000],
  'nectarine | nek-ta-ri-na | נקטרינה': [32.1 * 1000 , 1 * 1000],
  'clean | na-ki | נקי': [33.56 * 1000 , 1 * 1000],
  'married | na-su-i | נשוי': [34.9 * 1000 , 1 * 1000],
  'weapon | ne-shek | נשק': [36.1 * 1000 , 1 * 1000],
  'grandfather | sa-ba | סבא': [37.5 * 1000 , 1 * 1000],
  'soap | sa-bon | סבון': [38.74 * 1000 , 1 * 1000],
  'grandmother | sav-ta | סבתא': [40 * 1000 , 1 * 1000],
  'purple | sa-gol | סגול': [41.3 * 1000 , 1 * 1000],
  'closed | sa-gur | סגור': [42.68 * 1000 , 0.8 * 1000],
  'sheet | sa-din | סדין': [44 * 1000 , 1 * 1000],
  'sugar | su-kar | סוכר': [45.33 * 1000 , 1 * 1000],
  'end | sof | סוף': [46.54 * 1000 , 1 * 1000],
  'weekend | sof sha-vu-a | סוף שבוע': [47.9 * 1000 , 1 * 1000],
  'supermarket | su-per-mar-ket | סופרמרקט': [49.5 * 1000 , 1 * 1000],
  'student | stu-dent | סטודנט': [51.15 * 1000 , 1 * 1000],
  'story | si-pur | סיפור': [52.7 * 1000 , 1 * 1000],
  'knife | sa-kin | סכין': [54 * 1000 , 1 * 1000],
  'salad | sa-lat | סלט': [55.5 * 1000 , 1 * 1000],
  'excuse me | sli-kha | סליחה': [56.9 * 1000 , 1 * 1000],
  'beet(root) | se-lek | סלק': [58.16 * 1000 , 1 * 1000],
  'sandals | san-da-lim | סנדלים': [59.57 * 1000 , 1 * 1000],
  'sofa | sa-pa | ספה': [61 * 1000 , 1 * 1000],
  'sport | sport | ספורט': [62.33 * 1000 , 1 * 1000],
  'book | se-fer | ספר': [63.75 * 1000 , 1 * 1000],
  'library | sif-ri-ya | ספרייה': [65.15 * 1000 , 1 * 1000],
  'movie | se-ret | סרט': [66.4 * 1000 , 1 * 1000],
  'Fall | stav | סתיו': [67.54 * 1000 , 1 * 1000],
  'past | a-var | עבר': [68.78 * 1000 , 1 * 1000],
  'Hebrew | iv-rit | עברית': [70.1 * 1000 , 1 * 1000],
  'tomato | ag-va-ni-ya | עגבניה': [71.5 * 1000 , 1 * 1000],
  'mold | o-vesh | עובש': [72.83 * 1000 , 1 * 1000],
  'cake | u-ga | עוגה': [74 * 1000 , 1 * 1000],
  'world | o-lam | עולם': [75.25 * 1000 , 1 * 1000],
  'chicken | of | עוף': [76.4 * 1000 , 1 * 1000],
  'pen | et | עט': [77.6 * 1000 , 1 * 1000],
  'tired | a-yef | עייף': [78.75 * 1000 , 1 * 1000],
  'eye | a-yin | עין': [79.95 * 1000 , 1 * 1000],
  'city | ir | עיר': [81.1 * 1000 , 1 * 1000],
  'newspaper | i-ton | עיתון': [82.4 * 1000 , 1 * 1000],
  'spider | a-ka-vish | עכביש': [83.87 * 1000 , 1 * 1000],
  'now | akh-shav | עכשיו': [85.4 * 1000 , 1 * 1000],
  'on, about | al | על': [86.68 * 1000 , 1 * 1000],
  'grapes | a-na-vim | ענבים': [87.88 * 1000 , 1 * 1000],
  'poor | a-ni | עני': [89 * 1000 , 1 * 1000],
  'cloud | a-nan | ענן': [90.35 * 1000 , 1 * 1000],
  'pencil | i-pa-ron | עפרון': [91.7 * 1000 , 1 * 1000],
  'tree, wood | ets | עץ': [93 * 1000 , 1 * 1000],
  'stop | a-tsor | עצור': [94.4  * 1000 , 1 * 1000],
  'lazy | ats-lan | עצלן': [95.65  * 1000 , 1 * 1000],
  'bone | e-tsem | עצם': [97  * 1000 , 1 * 1000],
  'evening | e-rev | ערב': [98.5  * 1000 , 1 * 1000],
  'Arabic | a-ra-vit | ערבית': [99.84 * 1000 , 1 * 1000],
  'channel (tv) | a-ruts | ערוץ': [101.14 * 1000 , 1 * 1000],

  'rich | a-shir | עשיר': [102.5 * 1000 , 1 * 1000],
  'future | a-tid | עתיד': [103.92 * 1000 , 1 * 1000],
  'mouth | pe | פה': [105.4 * 1000 , 0.7 * 1000],
  'here | po | פה': [106.5 * 1000 , 0.7 * 1000],
  'garbage can | pakh ash-pa | פח אשפה': [107.75 * 1000 , 1 * 1000],
  'parsley | pet-ro-zil-ya | פטרוזיליה': [109 * 1000 , 1 * 1000],
  'mushrooms | pit-ri-yot | פטריות': [110.6 * 1000 , 1 * 1000],
  'smart | pi-ke-akh | פיקח': [111.84 * 1000 , 1 * 1000],
  'pita | pi-ta | פיתה': [113.25 * 1000 , 0.7 * 1000],
  'falafel | fa-la-fel | פלאפל': [114.34 * 1000 , 1 * 1000],
  'pepper | pil-pel | פלפל': [115.82 * 1000 , 1 * 1000],
  'face | pa-nim | פנים': [117.15 * 1000 , 1 * 1000],
  'pasta | pas-ta | פסטה': [118.47 * 1000 , 1 * 1000],
  'piano | psan-ter | פסנתר': [119.6 * 1000 , 1 * 1000],
  'once | pa-am | פעם': [120.99 * 1000 , 1 * 1000],
  'twice | pa-a-ma-yim | פעמים': [122.30 * 1000 , 1 * 1000],
  'faculty | fa-kul-ta | פקולטה': [123.8 * 1000 , 1 * 1000],
  'fruit | pri | פרי': [125.12 * 1000 , 1 * 1000],
  'chapter | pe-rek | פרק': [126.6 * 1000 , 1 * 1000],

  'simple | pa-shut | פשוט': [127.8 * 1000 , 1 * 1000],
  'open | pa-tu-akh | פתוח': [129.15 * 1000 , 1 * 1000],
  'color | tse-va | צבע': [130.4 * 1000 , 1 * 1000],
  'IDF | tsa-hal | צהל': [131.7 * 1000 , 1 * 1000],
  'yellow | tsa-hov | צהוב': [133.23 * 1000 , 1 * 1000],
  'noon | tso-ho-ra-yim | צהריים': [134.69 * 1000 , 1 * 1000],
}, false);




var sprite500_500 = addAudioSentances('500_words_401-500', 'sprite500_500', {
  'bird | tsi-por | ציפור': [0.00 * 1000 , 1 * 1000],
  'plate | tsa-la-khat | צלחת': [1.44 * 1000 , 1 * 1000],
  'North | tsa-fon | צפון': [2.84 * 1000 , 1 * 1000],
  'team | kvu-tsa | קבוצה': [4.14 * 1000 , 1 * 1000],
  'receipt | ka-ba-la | קבלה': [5.40 * 1000 , 1 * 1000],
  'small | ka-tan | קטן': [6.65 * 1000 , 1 * 1000],
  'quinoa | ki-no-a | קינואה': [8 * 1000 , 1 * 1000],
  'Summer | ka-yits | קיץ': [9.25 * 1000 , 1 * 1000],
  'wall | kir | קיר': [10.6 * 1000 , 1 * 1000],
  'squash, zucchini | ki-shu | קישוא': [11.84 * 1000 , 1 * 1000],
  'easy | kal | קל': [13 * 1000 , 1 * 1000],
  'mall | kan-yon | קניון': [14.35 * 1000 , 1 * 1000],
  'bowl | ke-a-ra | קערה': [15.50 * 1000 , 1 * 1000],
  'coffee | ka-fe | קפה': [16.36 * 1000 , 1 * 1000],
  'a little | k-tsat | קצת': [17.73 * 1000 , 1 * 1000],
  'cold | kar | קר': [19 * 1000 , 1 * 1000],
  'difficult | ka-she | קשה': [20.15 * 1000 , 1 * 1000],
  'head | rosh | ראש': [21.4 * 1000 , 1 * 1000],
  'first | ri-shon | ראשון': [22.8 * 1000 , 1 * 1000],
  'rabbi | rav | רב': [24.18 * 1000 , 1 * 1000],
  'quarter (of something) | re-va | רבע': [25.48 * 1000 , 1 * 1000],
  'leg | re-gel | רגל': [26.6 * 1000 , 1 * 1000],
  'moment | re-ga | רגע': [27.85 * 1000 , 1 * 1000],
  'sauce | ro-tev | רוטב': [29.19 * 1000 , 1 * 1000],
  'noisy | ro-esh | רועש': [30.55 * 1000 , 1 * 1000],
  'doctor/physician | ro-fe | רופא': [31.78 * 1000 , 1 * 1000],
  'thin | ra-ze | רזה': [32.97 * 1000 , 1 * 1000],
  'street | re-khov | רחוב': [34 * 1000 , 1 * 1000],
  'wet | ra-tov | רטוב': [35.5 * 1000 , 1 * 1000],
  'pomegranate | ri-mon | רימון': [36.94 * 1000 , 1 * 1000],
  'soft | rakh | רך': [38.23 * 1000 , 1 * 1000],
  'train | ra-ke-vet | רכבת': [39.6 * 1000 , 1 * 1000],
  'bad | ra | רע': [40.85 * 1000 , 1 * 1000],
  'hungry | ra-ev | רעב': [42 * 1000 , 1 * 1000],
  'idea | ra-a-yon | רעיון': [43.5 * 1000 , 1 * 1000],
  'floor | rits-pa | רצפה': [44.95 * 1000 , 1 * 1000],
  'only | rak | רק': [46.3 * 1000 , 1 * 1000],
  'question | she-e-la | שאלה': [47.46 * 1000 , 1 * 1000],
  'week | sha-vu-a | שבוע': [48.67 * 1000 , 1 * 1000],
  'Saturday | sha-bat | שבת': [50.14 * 1000 , 1 * 1000],
  'again | shuv | שוב': [51.48 * 1000 , 1 * 1000],
  'shawarma | sha-war-ma | שווארמה': [52.68 * 1000 , 1 * 1000],
  'table | shul-khan | שולחן': [54 * 1000 , 1 * 1000],
  'garlic | shum | שום': [55.48 * 1000 , 1 * 1000],
  'hot chocolate | sho-ko kham | שוקו חם': [56.9 * 1000 , 1 * 1000],
  'chocolate | sho-ko-lad | שוקולד': [58.36 * 1000 , 1 * 1000],
  'plum | she-zif | שזיף': [59.79 * 1000 , 1 * 1000],
  'black | sha-khor | שחור': [61.32 * 1000 , 1 * 1000],
  'swimming | skhi-ya | שחייה': [62.67 * 1000 , 1 * 1000],
  'rug | sha-ti-akh | שטיח': [64 * 1000 , 1 * 1000],
  'teeth | shi-na-yim | שיניים': [65.46 * 1000 , 1 * 1000],
  'lesson | shi-ur | שיעור': [66.75 * 1000 , 1 * 1000],
  'shuttle taxi | shei-rut | שירות': [68.11 * 1000 , 1 * 1000],
  'neighborhood | shkhu-na | שכונה': [69.7 * 1000 , 1 * 1000],
  'of | shel | של': [70.94 * 1000 , 1 * 1000],
  'hello | sha-lom | שלום': [72.25 * 1000 , 1 * 1000],
  'third (of something) | shlish | שליש': [73.53 * 1000 , 1 * 1000],
  'whole | sha-lem | שלם': [74.83 * 1000 , 1 * 1000],
  'there | sham | שם': [76.2 * 1000 , 1 * 1000],
  'name | shem | שם': [77.3 * 1000 , 1 * 1000],
  'surname | shem mish-pa-kha | שם משפחה': [78.77 * 1000 , 1 * 1000],
  'first name | shem pra-ti | שם פרטי': [80.46 * 1000 , 1 * 1000],
  'left (direction) | smo-la | שמאלה': [82 * 1000 , 1 * 1000],
  'sky | sha-ma-yim | שמיים': [83.5 * 1000 , 1 * 1000],
  'oil | she-men | שמן': [85 * 1000 , 1 * 1000],
  'fat | sha-men | שמן': [86.55 * 1000 , 1 * 1000],
  'sun | she-mesh | שמש': [88 * 1000 , 1 * 1000],
  'year | sha-na | שנה': [89.45 * 1000 , 1 * 1000],
  'second (time) | shni-ya | שניה': [90.85 * 1000 , 1 * 1000],
  'schnitzel | shni-tsel | שניצל': [92.27 * 1000 , 1 * 1000],
  'hour | sha-a | שעה': [93.7 * 1000 , 1 * 1000],
  'clock | sha-on | שעון': [94.95 * 1000 , 1 * 1000],
  'goal (soccer) | sha-ar | שער': [96.36 * 1000 , 1 * 1000],
  'hair | se-ar | שער': [97.9 * 1000 , 1 * 1000],
  'language | sa-fa | שפה': [99.3 * 1000 , 1 * 1000],
  'almond | sha-ked | שקד': [100.8 * 1000 , 1 * 1000],
  'quiet | she-ket | שקט': [102.34 * 1000 , 1 * 1000],
  'shekel | she-kel | שקל': [103.7 * 1000 , 1 * 1000],
  'shakshuka | shak-shu-ka | שקשוקה': [105 * 1000 , 1 * 1000],
  'toilet (bathroom) | she-ru-tim | שרותים': [106.53 * 1000 , 1 * 1000],
  '(a) drink | shti-ya | שתייה': [107.8 * 1000 , 1 * 1000],
  'fig | te-e-na | תאנה': [109.1 * 1000 , 1 * 1000],
  'date of birth | ta-a-rikh lei-da | תאריך לידה': [110.5 * 1000 , 1 * 1000],
  'tea | te | תה': [112.12 * 1000 , 0.7 * 1000],
  'thank you | to-da | תודה': [113.40 * 1000 , 0.7 * 1000],
  'strawberry | tut | תות': [114.5 * 1000 , 0.7 * 1000],
  'hobby | takh-biv | תחביב': [115.6 * 1000 , 0.7 * 1000],
  'station, stop | ta-kha-na | תחנה': [116.8 * 1000 , 1 * 1000],
  'baby | ti-nok | תינוק': [118.26 * 1000 , 1 * 1000],
  'bag | tik | תיק': [119.78 * 1000 , 0.7 * 1000],
  'picture | tmu-na | תמונה': [120.7 * 1000 , 1 * 1000],
  'date (food) | ta-mar | תמר': [121.88 * 1000 , 1 * 1000],

  'traffic | tnu-a | תנועה': [123.3 * 1000 , 1 * 1000],
  'oven | ta-nur | תנור': [125.35 * 1000 , 1 * 1000],
  'orange (food) | ta-puz | תפוז': [126.5 * 1000 , 1 * 1000],
  'apple | ta-pu-akh | תפוח': [127.7 * 1000 , 1 * 1000],
  'potato | ta-pu-akh a-da-ma | תפוח אדמה': [129.19 * 1000 , 1 * 1000],
  'ceiling | tik-ra | תקרה': [130.8 * 1000 , 1 * 1000],
  'spinach | te-red | תרד': [132.16 * 1000 , 1 * 1000],
  'answer | tshu-va | תשובה': [133.47 * 1000 , 1 * 1000],

}, false);

// function playAll() {
//   document.querySelectorAll('.sprite > .sprite-label').forEach((item, index) => {
//     setTimeout(() => {
//         item.click();
//     }, index * 6000);
//   })
// }
sentanceIndex = 1;
var conversation1 = addAudioSentances('conversation1', 'conversation1', {
  'Shawarma is the greatest invention that the Middle East brought to the world. | sha-war-ma hi ha-ham-tsa-a ha-khi to-va she-ha-miz-rakh ha-ti-khon he-vi la-o-lam. | שווארמה היא ההמצאה הכי טובה שהמזרח התיכון הביא לעולם.': 
    [0 * 1000 , 4.88 * 1000],
  'It was invented by Muhammad ben Shawarma in 1867. | him-tsi o-ta mu-kha-mad ben sha-war-ma be-e-lef shmo-na me-ot shi-shim ve-she-va. | המציא אותה מוחמד בן שווארמה ב 1867.': 
    [5.35 * 1000 , 4.24 * 1000],
  'Really? | be-e-met? | באמת?': [9.86 * 1000 , 1.1 * 1000],
  'You really think so? I\'m kidding. | nir-e le-kha? a-ni tso-khek. | נראה לך? אני צוחק.': [11.40 * 1000 , 1.5 * 1000],

  'I have no idea. | ein li mu-sag. | אין לי מושג.': [12.96 * 1000 , 1.14 * 1000],

  'I think it originated in Turkey. | a-ni kho-shev she-ha-ma-kor she-la be-tur-ki-ya. | אני חושב שהמקור שלה בטורקיה.': 
    [14.56 * 1000 , 2.47 * 1000],
  'Could be. | ya-khol lih-yot. | יכול להיות.': [17.39 * 1000 , 1.3 * 1000],

  'Why are you so obsessed with shawarma? | la-ma a-ta ob-se-si-vi al sha-war-ma? | למה אתה אובססיבי על שווארמה?': [18.78 * 1000 , 2 * 1000],
  'It\'s really tasty! | hi te-i-ma la-a-la! | היא טעימה לאללה!': [21.1 * 1000 , 1.42 * 1000],
  'Fresh pita with veggies and meat. | pi-ta tri-ya im ye-ra-kot u-ba-sar. | פיתה טרייה עם ירקות ובשר.': [22.57 * 1000 , 1.95 * 1000],
  'What is better than that? | ma yo-ter tov mi-ze? | מה יותר טוב מזה?': [24.52 * 1000 , 1.5 * 1000],
  'I\'m vegetarian. | a-ni tsim-kho-ni. | אני צמחוני.': [26 * 1000 , 1.2 * 1000],
}, false);

sentanceIndex = 1;
var conversation2 = addAudioSentances('conversation2', 'conversation2', {
  'How long have you been studying Hebrew? | ka-ma zman a-ta kvar lo-med iv-rit? | כמה זמן אתה כבר לומד עברית?': 
    [0 * 1000 , 2.61 * 1000],
  'About three months. | shlo-sha kho-da-shim be-e-rekh. | שלושה חודשים בערך.': 
    [2.75 * 1000 , 2.22 * 1000],
  'Oh that\'s all? | ah, ze ha-kol? | אה, זה הכל?': [5.18 * 1000 , 1.7 * 1000],
  'You speak well for someone that studied only three months. | a-ta me-da-ber ya-fe bish-vil e-khad she-la-mad rak shlo-sha kho-da-shim. | אתה מדבר יפה בשביל אחד שלמד רק שלושה חודשים.': 
    [6.9 * 1000 , 3.93 * 1000],
  'Thanks, I study two hours every day. | to-da, a-ni lo-med sha-a-ta-yim kol yom. | תודה, אני לומד שעתיים כל יום.': 
    [10.78 * 1000 , 3.2 * 1000],
  'How do you study? | eikh a-ta lo-med? | איך אתה לומד?': [14.45 * 1000 , 1.13 * 1000],
  'Do you have a private teacher or something? | yesh le-kha mo-re pra-ti o ma-she-hu? | יש לך מורה פרטי או משהו?': 
    [15.58 * 1000 , 2.08 * 1000],
  'No, I study by myself. | lo, a-ni lo-med le-vad. | לא, אני לומד לבד.': 
    [17.9 * 1000 , 1.96 * 1000],
  'I read books, watch movies, and memorize music lyrics. | a-ni kor-e sfa-rim, tso-fe ba-sra-tim, ve-lo-med be-al pe mi-lot shi-rim. | אני קורא ספרים, צופה בסרטים ולומד בעל פה מילות שירים.': 
    [19.8 * 1000 , 4.25 * 1000],
  'I\'m very impressed. | hir-sham-ta o-ti. | הרשמת אותי.': [24.17 * 1000 , 1.36 * 1000],
  'Keep up the good work. | tam-shikh ka-kha. | תמשיך ככה.': [25.55 * 1000 , 1.08 * 1000],
}, false);

var playingTimerId;
function playSprits(sprites, index, delay, repeats) {
  if (index >= sprites.length) {
    return;
  }
  currentAudio = sprites[index];
  var repeatTimes = repeats || (currentAudio._sprite.length > 10 ? 1 : 2);
  currentAudio.playAll(0, delay, repeatTimes).then(() => {
    playingTimerId = setTimeout(() => {
      playSprits(sprites, index + 1, delay, repeatTimes);
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
function playAllNew() {
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits(spritesArray.slice(4), 0, 1500);
}
function playAll500(sprits) {
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits([sprits], 0, 1000, 3);
}

function playConversation(sprits) {
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits([sprits], 0, 1200, 3);
}

function playAll100(index) {
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  if (index) {
    playSprits([spritesArray[index]], 0, 1000, 1);
  } else {
    playSprits(spritesArray.slice(0, 4), 0, 1000, 1);
  }
}

async function playSelected () {
  var selectedCheckboxes = document.querySelectorAll('.sprite input[type="checkbox"]:checked');

  for (let i = 0; i < selectedCheckboxes.length; i++) {
    var spritesObj = selectedCheckboxes[i].getAttribute('data-sprites-obj');
    var spriteKey = selectedCheckboxes[i].getAttribute('data-sprite-key');

    await window[spritesObj]?.playSelected(spriteKey);
    await sleep(1000);
    await window[spritesObj]?.playSelected(spriteKey);
    await sleep(1000);
    // infinite loop
    if (i+1 >= selectedCheckboxes.length) {
      i = -1;
    }
  }
}

function pauseAudio() {
  currentAudio?.sound?.pause();
}
function resumeAudio() {
  currentAudio?.sound?.play();
}

setTimeout(() => {
  var selectedSprites = JSON.parse(localStorage.getItem('sprites')) || {};
  document.querySelectorAll('.sprite').forEach((item, index) => {
    item.querySelector('input').checked = selectedSprites[item.id] || false;
    if (selectedSprites[item.id]) {
      item.classList.add('selected');
    }
  });

  document.querySelectorAll('.keep-repeating').forEach((item, index) => {
    item.addEventListener('click', async function(e) {
      var selectedCheckbox = e.target;

      // if(selectedCheckbox?.checked) {
        var spritesObj = selectedCheckbox.getAttribute('data-sprites-obj');
        var spriteKey = selectedCheckbox.getAttribute('data-sprite-key');
        while (selectedCheckbox?.checked) {
          await window[spritesObj]?.playSelected(spriteKey);
          await sleep(1000);
        }
      // }
    }, false);
  });
}, 50);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
