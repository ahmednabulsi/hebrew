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

var currentIndex = undefined;
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

        currentIndex = parseInt(e.target.getAttribute('data-sprite-index'));
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
              let nextIndex = index + 1;
              if (currentIndex) {
                nextIndex = currentIndex;
                currentIndex = undefined;
              }
              self.playAll(nextIndex, delay, repeat, 0).then((result) => {
                resolve(result);
              });
            }, delay);
          } else {
            let nextIndex = index + 1;
            if (currentIndex) {
              nextIndex = currentIndex;
              currentIndex = undefined;
            }
            self.playAll(nextIndex, delay, repeat, 0).then((result) => {
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

var spritContainer = document.querySelector('.sprites');

var spritesArray = [];
// Setup our new sprite class and pass in the options.

var sentanceIndex = 1;

function addAudioSentances(name, spriteObjName, sentences, addToArray = true, rate = 1) {
  var spriteMap = {};
  Object.keys(sentences).forEach((key, index) => {
    var sprit = document.createElement('div');
    sprit.setAttribute('id', key.replace(/ |\.|\'|\?|\’|\/|\;|\(|\)|\/|\,|\||\!/g,'-'));
    sprit.setAttribute('class', 'sprite');
    sprit.innerHTML = `<label><input data-sprite-key="${key}" data-sprites-obj="${spriteObjName}" type="checkbox">
    </label><div class="sprite-label" data-sprite-index="${index}">[${sentanceIndex++}] ${key}</div><label><input class="keep-repeating" data-sprite-key="${key}" data-sprites-obj="${spriteObjName}" type="checkbox">
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

// var s3 = addAudioSentances('s3', 's3', {
//   'What\'s up. - מה העניינים. ' : [ 0 * 1000, 1 * 1000 ],
//   'God bless every day. - ברוך השם יום יום.' : [ 1 * 1000, 1.7 * 1000 ],
//   'do you want something to drink - אתה רוצה לשתות משהו.' : [ 2.8 * 1000, 1.65 * 1000 ],
//   'not for now. - בינתיים לא.' : [ 4.47 * 1000, 1.13 * 1000 ],
//   'Hamas wants to rule the world. - חמאס רוצה לשלוט בעולם.' : [ 5.64 * 1000, 1.9 * 1000 ],
//   'How to control crowds? - איך לשלוט בהמונים?' : [ 7.58 * 1000, 1.5 * 1000 ],
//   'make them ignorant, sick, poor. - להפוך אותם לבורים, חולים,  עניים.' : [ 9.1 * 1000, 2.8 * 1000 ],
//   'nobody. - אף אחד.' : [ 11.95 * 1000, 1 * 1000 ],
//   'We don\'t give up on anyone. - אנחנו לא מוותרים על אף אחד.' : [ 13 * 1000, 2 * 1000 ],
//   'what did you do there? - מה עשית שם?' : [ 15 * 1000, 1.3 * 1000 ],
//   'What are you doing? - מה אתה עושה?' : [ 16.3 * 1000, 1 * 1000 ],
//   'The captain must not be replaced. - אסור להחליף את הקברניט.' : [ 17.3 * 1000, 2 * 1000 ],
// });

var s3 = addAudioSentances('s3', 's3', {
  'What\'s up. - מה העניינים. ' : [ 0 * 1000, 1.16 * 1000 ],
  'God bless every day. - ברוך השם יום יום.' : [ 1.2 * 1000, 1.9 * 1000 ],
  'do you want something to drink - אתה רוצה לשתות משהו.' : [ 3.13 * 1000, 1.8 * 1000 ],
  'not for now. - בינתיים לא.' : [ 5 * 1000, 1.25 * 1000 ],
  'Israel wants to rule the world. - ישראל רוצה לשלוט בעולם.' : [ 6.25 * 1000, 2.3 * 1000 ],
  'How to control crowds? - איך לשלוט בהמונים?' : [ 8.6 * 1000, 1.6 * 1000 ],
  'make them ignorant, sick, poor. - להפוך אותם לבורים, חולים,  עניים.' : [ 10.3 * 1000, 3.18 * 1000 ],
  'nobody. - אף אחד.' : [ 13.53 * 1000, 1.13 * 1000 ],
  'We don\'t give up on anyone. - אנחנו לא מוותרים על אף אחד.' : [ 14.64 * 1000, 2.15 * 1000 ],
  'what did you do there? - מה עשית שם?' : [ 16.92 * 1000, 1.35 * 1000 ],
  'What are you doing? - מה אתה עושה?' : [ 18.3 * 1000, 1 * 1000 ],
  'The captain must not be replaced. - אסור להחליף את הקברניט.' : [ 19.4 * 1000, 2.1 * 1000 ],
});


var s1 = addAudioSentances('s1', 's1', {
  'תן בראש. go get them': [0 * 1000, 0.98 * 1000],
  'שיחקת אותה. you nailed it': [1 * 1000, 1.135 * 1000],
  'מרגש ברמות . Very exciting': [2.15 * 1000, 1.33 * 1000],
  'ירד גשם מאוד אתמול. It rained a lot yesterday': [3.55 * 1000, 1.67 * 1000],
  'אני עסוק. I am busy': [5.24 * 1000, 1 * 1000],
  'תודה על המתנה. thank you for the present': [6.31 * 1000, 1.2 * 1000],
  'מחר ירד גשם.  It will rain tomorrow': [7.58 * 1000, 1.57 * 1000],
  'האיש חותך עוף. The man cuts a chicken': [9.2 * 1000, 1.3 * 1000],
});

var s2 = addAudioSentances('s2', 's2', {
  'לבטל את הפגישה. Cancel the meeting.': [0 * 1000, 1.23 * 1000],
  'אללה יביא לו מזל טוב.': [1.28 * 1000, 1.56 * 1000],
  'אנחנו נלחמים בחיות אדם ואנחנו נוהגים בהתאם.': [3 * 1000, 3.4 * 1000],
  'הגיע הזמן!.  جاء الوقت': [6.5 * 1000, 1.26 * 1000],
  'סוף סוף תודה רבה.': [7.79 * 1000, 1.44 * 1000],
  'קדימה מעשים פחות דיבורים. Let\'s do less talk.': [9.29 * 1000, 2 * 1000],
  'tell him to bring food': [11.36 * 1000, 1.5 * 1000],
  'I agree': [12.93 * 1000, 0.9 * 1000],
});





// 0: "to be able to, can | אוכל | יכול | li-hi-yot me-su-gal - ya-khol-ti - ya-khol - u-khal -  - "
// 1: "to like, love | אוהב | אוהב | le-e-hov - a-hav-ti - o-hev - o-hav -  - "
// 2: "to be late | אאחר | מאחר | le-a-kher - i-khar-ti - me-a-kher - a-a-kher -  - "
// 3: "to eat | אוכל | אוכל | le-e-khol - a-khal-ti - o-khel - o-khal -  - "
// 4: "to come | אבוא | בא | la-vo - ba-ti - ba - a-vo -  - "
// 5: "to choose | אבחר | בוחר | liv-khor - ba-khar-ti - bo-kher - ev-khar -  - "
// 6: "to visit | אבקר | מבקר | le-va-ker - bi-kar-ti - me-va-ker - a-va-ker -  - "
// 7: "to ask, request | אבקש | מבקש | le-va-kesh - bi-kash-ti - me-va-kesh - a-va-kesh -  - "
// 8: "to cook | אבשל | מבשל | le-va-shel - bi-shal-ti - me-va-shel - a-va-shel -  - "
// 9: "to live | אגור | גר | la-gur - gar-ti - gar - a-gur -  - "
// 10: "to speak | אדבר | מדבר | le-da-ber - di-bar-ti - me-da-ber - a-da-ber -  - "
// 11: "to know (something) | אדע | יודע | la-da-at - ya-da-ti - yo-de-a - e-da -  - "
// 12: "to believe | אאמין | מאמין | le-ha-a-min - he-e-man-ti - ma-a-min - a-a-min -  - "
// 13: "to bring | אביא | מביא | le-ha-vi - he-ve-ti - me-vi - a-vi -  - "
// 14: "to understand | אבין | מבין | le-ha-vin - he-van-ti - me-vin - a-vin -  - "
// 15: "to say, tell | אגיד |  | le-ha-gid -  -  - a-gid -  - "
// 16: "to arrive | אגיע | מגיע | le-ha-gi-a - hi-ga-ti - ma-gi-a - a-gi-a -  - "
// 17: "to order, invite | אזמין | מזמין | le-haz-min - hiz-man-ti - maz-min - az-min -  - "
// 18: "to decide | אחליט | מחליט | le-hakh-lit - hekh-lat-te-ti - makh-lit - akh-lit -  - "
// 19: "to be | אהיה |  | li-hi-yot - ha-yi-ti -  - e-he-ye -  - "
// 20: "to enter | אכנס | נכנס | le-hi-ka-nes - nikh-nas-ti - nikh-nas - e-ka-nes -  - "
// 21: "to meet | אפגש | נפגש | le-hi-pa-gesh - nif-gash-ti - nif-gash - e-pa-gesh -  - "
// 22: "to stay | אשאר | נשאר | le-hi-sha-er - nish-ar-ti - nish-ar - e-sha-er -  - "
// 23: "to know (someone), be familiar with | אכיר | מכיר | le-ha-kir - hi-kar-ti - ma-kir - a-kir -  - "
// 24: "to recommend | אמליץ | ממליץ | le-ham-lits - him-lats-ti - mam-lits - am-lits -  - "
// 25: "to explain | אסביר | מסביר | le-has-bir - his-bar-ti - mas-bir - as-bir -  - "
// 26: "to agree | אסכים | מסכים | le-has-kim - his-kam-ti - mas-kim - as-kim -  - "
// 27: "to look, watch | אסתכל | מסתכל | le-his-ta-kel - his-ta-kal-ti - mis-ta-kel - es-ta-kel -  - "
// 28: "to prefer | אעדיף | מעדיף | le-ha-a-dif - he-e-daf-ti - ma-a-dif - a-a-dif -  - "
// 29: "to stop | אפסיק | מפסיק | le-haf-sik - hif-sak-ti - maf-sik - af-sik -  - "
// 30: "to disturb | אפריע | מפריע | le-ha-fri-a - hif-ra-ti - maf-ri-a - af-ri-a -  - "
// 31: "to need | אצטרך | צריך | le-hits-ta-rekh - ha-yi-ti tsa-rikh - tsa-rikh - ets-ta-rekh -  - "
// 32: "to listen | אקשיב | מקשיב | le-hak-shiv - hik-shav-ti - mak-shiv - ak-shiv -  - "
// 33: "to feel | ארגיש | מרגיש | le-har-gish - hir-gash-ti - mar-gish - ar-gish -  - "
// 34: "to obtain | אשיג | משיג | le-ha-sig - hi-sag-ti - ma-sig - a-sig -  - "
// 35: "to use | אשתמש | משתמש | le-hish-ta-mesh - hish-ta-mash-ti - mish-ta-mesh - esh-ta-mesh -  - "
// 36: "to participate | אשתתף | משתתף | le-hish-ta-tef - hish-ta-taf-ti - mish-ta-tef - esh-ta-tef -  - "
// 37: "to start | אתחיל | מתחיל | le-hat-khil - hit-khal-ti - mat-khil - at-khil -  - "
// 38: "to intend | אתכוון | מתכוון | le-hit-ka-ven - hit-ka-van-ti - mit-ka-ven - et-ka-ven -  - "
// 39: "to exercise | אתעמל | מתעמל | le-hit-a-mel - hit-a-mal-ti - mit-a-mel - et-a-mel -  - "
// 40: "to phone, call | אתקשר | מתקשר | le-hit-ka-sher - hit-ka-shar-ti - mit-ka-sher - et-ka-sher -  - "
// 41: "to say | אומר | אומר | lo-mar - a-mar-ti - o-mer - o-mar -  - "
// 42: "to move | אזוז | זז | la-zuz - zaz-ti - zaz - a-zuz -  - "
// 43: "to remember | אזכור | זוכר | liz-kor - za-khar-ti - zo-kher - ez-kor -  - "
// 44: "to return (come back); repeat | אחזור | חוזר | lakh-zor - kha-zar-ti - kho-zer - e-khe-zor -  - "
// 45: "to wait | אחכה | מחכה | le-kha-kot - khi-ki-ti - me-kha-ke - a-kha-ke -  - "
// 46: "to park | אחנה | חונה | lakh-not - kha-ni-ti - kho-ne - ekh-ne -  - "
// 47: "to look for | אחפש | מחפש | le-kha-pes - khi-pas-ti - me-kha-pes - a-kha-pes -  - "
// 48: "to think | אחשוב | חושב | lakh-shov - kha-shav-ti - kho-shev - akh-shov -  - "
// 49: "to fly | אטוס | טס | la-tus - tas-ti - tas - a-tus -  - "


// "to be able to, can | אוכל | יכול | li-hi-yot me-su-gal - ya-khol-ti - ya-khol - u-khal"
// "to like, love | אוהב | אוהב | le-e-hov - a-hav-ti - o-hev - o-hav"
// "to be late | אאחר | מאחר | le-a-kher - i-khar-ti - me-a-kher - a-a-kher"
// "to eat | אוכל | אוכל | le-e-khol - a-khal-ti - o-khel - o-khal"
// "to come | אבוא | בא | la-vo - ba-ti - ba - a-vo"
// "to choose | אבחר | בוחר | liv-khor - ba-khar-ti - bo-kher - ev-khar"
// "to visit | אבקר | מבקר | le-va-ker - bi-kar-ti - me-va-ker - a-va-ker"
// "to ask, request | אבקש | מבקש | le-va-kesh - bi-kash-ti - me-va-kesh - a-va-kesh"
// "to cook | אבשל | מבשל | le-va-shel - bi-shal-ti - me-va-shel - a-va-shel"
// "to live | אגור | גר | la-gur - gar-ti - gar - a-gur"
// "to speak | אדבר | מדבר | le-da-ber - di-bar-ti - me-da-ber - a-da-ber"
// "to know (something) | אדע | יודע | la-da-at - ya-da-ti - yo-de-a - e-da"
// "to believe | אאמין | מאמין | le-ha-a-min - he-e-man-ti - ma-a-min - a-a-min"
// "to bring | אביא | מביא | le-ha-vi - he-ve-ti - me-vi - a-vi"
// "to understand | אבין | מבין | le-ha-vin - he-van-ti - me-vin - a-vin"
// "to say, tell | אגיד |  | le-ha-gid -  -  - a-gid"
// "to arrive | אגיע | מגיע | le-ha-gi-a - hi-ga-ti - ma-gi-a - a-gi-a"
// "to order, invite | אזמין | מזמין | le-haz-min - hiz-man-ti - maz-min - az-min"
// "to decide | אחליט | מחליט | le-hakh-lit - hekh-lat-te-ti - makh-lit - akh-lit"
// "to be | אהיה |  | li-hi-yot - ha-yi-ti -  - e-he-ye"
// "to enter | אכנס | נכנס | le-hi-ka-nes - nikh-nas-ti - nikh-nas - e-ka-nes"
// "to meet | אפגש | נפגש | le-hi-pa-gesh - nif-gash-ti - nif-gash - e-pa-gesh"
// "to stay | אשאר | נשאר | le-hi-sha-er - nish-ar-ti - nish-ar - e-sha-er"
// "to know (someone), be familiar with | אכיר | מכיר | le-ha-kir - hi-kar-ti - ma-kir - a-kir"
// "to recommend | אמליץ | ממליץ | le-ham-lits - him-lats-ti - mam-lits - am-lits"
// "to explain | אסביר | מסביר | le-has-bir - his-bar-ti - mas-bir - as-bir"
// "to agree | אסכים | מסכים | le-has-kim - his-kam-ti - mas-kim - as-kim"
// "to look, watch | אסתכל | מסתכל | le-his-ta-kel - his-ta-kal-ti - mis-ta-kel - es-ta-kel"
// "to prefer | אעדיף | מעדיף | le-ha-a-dif - he-e-daf-ti - ma-a-dif - a-a-dif"
// "to stop | אפסיק | מפסיק | le-haf-sik - hif-sak-ti - maf-sik - af-sik"
// "to disturb | אפריע | מפריע | le-ha-fri-a - hif-ra-ti - maf-ri-a - af-ri-a"
// "to need | אצטרך | צריך | le-hits-ta-rekh - ha-yi-ti tsa-rikh - tsa-rikh - ets-ta-rekh"
// "to listen | אקשיב | מקשיב | le-hak-shiv - hik-shav-ti - mak-shiv - ak-shiv"
// "to feel | ארגיש | מרגיש | le-har-gish - hir-gash-ti - mar-gish - ar-gish"
// "to obtain | אשיג | משיג | le-ha-sig - hi-sag-ti - ma-sig - a-sig"
// "to use | אשתמש | משתמש | le-hish-ta-mesh - hish-ta-mash-ti - mish-ta-mesh - esh-ta-mesh"
// "to participate | אשתתף | משתתף | le-hish-ta-tef - hish-ta-taf-ti - mish-ta-tef - esh-ta-tef"
// "to start | אתחיל | מתחיל | le-hat-khil - hit-khal-ti - mat-khil - at-khil"
// "to intend | אתכוון | מתכוון | le-hit-ka-ven - hit-ka-van-ti - mit-ka-ven - et-ka-ven"
// "to exercise | אתעמל | מתעמל | le-hit-a-mel - hit-a-mal-ti - mit-a-mel - et-a-mel"
// "to phone, call | אתקשר | מתקשר | le-hit-ka-sher - hit-ka-shar-ti - mit-ka-sher - et-ka-sher"
// "to say | אומר | אומר | lo-mar - a-mar-ti - o-mer - o-mar"
// "to move | אזוז | זז | la-zuz - zaz-ti - zaz - a-zuz"
// "to remember | אזכור | זוכר | liz-kor - za-khar-ti - zo-kher - ez-kor"
// "to return (come back); repeat | אחזור | חוזר | lakh-zor - kha-zar-ti - kho-zer - e-khe-zor"
// "to wait | אחכה | מחכה | le-kha-kot - khi-ki-ti - me-kha-ke - a-kha-ke"
// "to park | אחנה | חונה | lakh-not - kha-ni-ti - kho-ne - ekh-ne"
// "to look for | אחפש | מחפש | le-kha-pes - khi-pas-ti - me-kha-pes - a-kha-pes"
// "to think | אחשוב | חושב | lakh-shov - kha-shav-ti - kho-shev - akh-shov"
// "to fly | אטוס | טס | la-tus - tas-ti - tas - a-tus"

sentanceIndex = 1;
var v1 = addAudioSentances('100_verbs_1-50', 'v1', {
  'להיות מסוגל | יכולתי | יכול | אוכל | to be able to, can || li-hi-yot me-su-gal - ya-khol-ti - ya-khol - u-khal': [0 * 1000, 5.27 * 1000],
  'לאהוב | אהבתי | אוהב | אוהב | to like, love || le-e-hov - a-hav-ti - o-hev - o-hav': [ 5.57 * 1000, 5.15 * 1000],
  'לאחר | אחרתי | מאחר | אאחר | to be late || le-a-kher - i-khar-ti - me-a-kher - a-a-kher': [ 10.8 * 1000, 5.7 * 1000],
  'לאכול | אכלתי | אוכל | אוכל | to eat || le-e-khol - a-khal-ti - o-khel - o-khal': [ 16.6 * 1000, 5.87 * 1000],
  'לבוא | באתי | בא | אבוא | to come || la-vo - ba-ti - ba - a-vo': [ 22.5 * 1000, 5 * 1000],
  'לבחור | בחרתי | בוחר | אבחר | to choose || liv-khor - ba-khar-ti - bo-kher - ev-khar': [ 27.6 * 1000, 5.25 * 1000],
  'לבקר | בקרתי | מבקר | אבקר | to visit || le-va-ker - bi-kar-ti - me-va-ker - a-va-ker': [ 33 * 1000, 5.9 * 1000],
  'לבקש | בקשתי | מבקש | אבקש | to ask, request || le-va-kesh - bi-kash-ti - me-va-kesh - a-va-kesh': [ 38.9 * 1000, 5.7 * 1000],
  'לבשל | בשלתי | מבשל | אבשל | to cook || le-va-shel - bi-shal-ti - me-va-shel - a-va-shel': [ 44.7 * 1000, 5.7 * 1000],
  'לגור | גרתי | גר | אגור | to live || la-gur - gar-ti - gar - a-gur': [ 50.7 * 1000, 4.7 * 1000],
  'לדבר | דברתי | מדבר | אדבר | to speak || le-da-ber - di-bar-ti - me-da-ber - a-da-ber': [ 55.65 * 1000, 5.3 * 1000],
  'לדעת | ידעתי | יודע | אדע | to know (something) || la-da-at - ya-da-ti - yo-de-a - e-da': [ 61.17 * 1000, 5.15 * 1000],
  'להאמין | האמנתי | מאמין | אאמין | to believe || le-ha-a-min - he-e-man-ti - ma-a-min - a-a-min': [ 66.57 * 1000, 5.57 * 1000],
  'להביא | הבאתי | מביא | אביא | to bring || le-ha-vi - he-ve-ti - me-vi - a-vi': [ 72.17 * 1000, 5.6 * 1000],
  'להבין | הבנתי | מבין | אבין | to understand || le-ha-vin - he-van-ti - me-vin - a-vin': [ 78 * 1000, 5.5 * 1000],
  'להגיד |  |  | אגיד | to say, tell || le-ha-gid - a-gid -  - ': [ 83.5 * 1000, 3 * 1000],
  'להגיע | הגעתי | מגיע | אגיע | to arrive || le-ha-gi-a - hi-ga-ti - ma-gi-a - a-gi-a': [ 87 * 1000, 5.5 * 1000],
  'להזמין | הזמנתי | מזמין | אזמין | to order, invite || le-haz-min - hiz-man-ti - maz-min - az-min': [ 92.4 * 1000, 5.84 * 1000],
  'להחליט | החלטתי | מחליט | אחליט | to decide || le-hakh-lit - hekh-lat-te-ti - makh-lit - akh-lit': [ 98.3 * 1000, 5.65 * 1000],
  'להיות | הייתי |  | אהיה | to be || li-hi-yot - ha-yi-tie-he-ye -  - ': [ 104.3 * 1000, 3.8 * 1000],
  'להיכנס | נכנסתי | נכנס | אכנס | to enter || le-hi-ka-nes - nikh-nas-ti - nikh-nas - e-ka-nes': [108.45 * 1000, 5.6 * 1000],
  'להיפגש | נפגשתי | נפגש | אפגש | to meet || le-hi-pa-gesh - nif-gash-ti - nif-gash - e-pa-gesh': [ 113.57 * 1000, 6 * 1000],
  'להישאר | נשארתי | נשאר | אשאר | to stay || le-hi-sha-er - nish-ar-ti - nish-ar - e-sha-er': [ 119.64 * 1000, 5.8 * 1000],
  'להכיר | הכרתי | מכיר | אכיר | to know (someone), be familiar with || le-ha-kir - hi-kar-ti - ma-kir - a-kir': [ 125.7 * 1000, 5.4 * 1000],
  'להמליץ | המלצתי | ממליץ | אמליץ | to recommend || le-ham-lits - him-lats-ti - mam-lits - am-lits': [ 131.22 * 1000, 5.5 * 1000],
  'להסביר | הסברתי | מסביר | אסביר | to explain || le-has-bir - his-bar-ti - mas-bir - as-bir': [ 137 * 1000, 5.87 * 1000],
  'להסכים | הסכמתי | מסכים | אסכים | to agree || le-has-kim - his-kam-ti - mas-kim - as-kim': [ 142.9 * 1000, 5.6 * 1000],
  'להסתכל | הסתכלתי | מסתכל | אסתכל | to look, watch || le-his-ta-kel - his-ta-kal-ti - mis-ta-kel - es-ta-kel': [ 148.64 * 1000, 6.3 * 1000],
  'להעדיף | העדפתי | מעדיף | אעדיף | to prefer || le-ha-a-dif - he-e-daf-ti - ma-a-dif - a-a-dif': [ 155 * 1000, 5.8 * 1000],
  'להפסיק | הפסקתי | מפסיק | אפסיק | to stop || le-haf-sik - hif-sak-ti - maf-sik - af-sik': [ 161 * 1000, 5.5 * 1000],

// 'להיות מסוגל | יכולתי | יכול | אוכל | to be able to, can || li-hi-yot me-su-gal - ya-khol-ti - ya-khol - u-khal',
// 'לאהוב | אהבתי | אוהב | אוהב | to like, love || le-e-hov - a-hav-ti - o-hev - o-hav',
// 'לאחר | אחרתי | מאחר | אאחר | to be late || le-a-kher - i-khar-ti - me-a-kher - a-a-kher',
// 'לאכול | אכלתי | אוכל | אוכל | to eat || le-e-khol - a-khal-ti - o-khel - o-khal',
// 'לבוא | באתי | בא | אבוא | to come || la-vo - ba-ti - ba - a-vo',
// 'לבחור | בחרתי | בוחר | אבחר | to choose || liv-khor - ba-khar-ti - bo-kher - ev-khar',
// 'לבקר | בקרתי | מבקר | אבקר | to visit || le-va-ker - bi-kar-ti - me-va-ker - a-va-ker',
// 'לבקש | בקשתי | מבקש | אבקש | to ask, request || le-va-kesh - bi-kash-ti - me-va-kesh - a-va-kesh',
// 'לבשל | בשלתי | מבשל | אבשל | to cook || le-va-shel - bi-shal-ti - me-va-shel - a-va-shel',
// 'לגור | גרתי | גר | אגור | to live || la-gur - gar-ti - gar - a-gur',
// 'לדבר | דברתי | מדבר | אדבר | to speak || le-da-ber - di-bar-ti - me-da-ber - a-da-ber',
// 'לדעת | ידעתי | יודע | אדע | to know (something) || la-da-at - ya-da-ti - yo-de-a - e-da',
// 'להאמין | האמנתי | מאמין | אאמין | to believe || le-ha-a-min - he-e-man-ti - ma-a-min - a-a-min',
// 'להביא | הבאתי | מביא | אביא | to bring || le-ha-vi - he-ve-ti - me-vi - a-vi',
// 'להבין | הבנתי | מבין | אבין | to understand || le-ha-vin - he-van-ti - me-vin - a-vin',
// 'להגיד |  |  | אגיד | to say, tell || le-ha-gid - a-gid -  - ',
// 'להגיע | הגעתי | מגיע | אגיע | to arrive || le-ha-gi-a - hi-ga-ti - ma-gi-a - a-gi-a',
// 'להזמין | הזמנתי | מזמין | אזמין | to order, invite || le-haz-min - hiz-man-ti - maz-min - az-min',
// 'להחליט | החלטתי | מחליט | אחליט | to decide || le-hakh-lit - hekh-lat-te-ti - makh-lit - akh-lit',
// 'להיות | הייתי |  | אהיה | to be || li-hi-yot - ha-yi-tie-he-ye -  - ',
// 'להיכנס | נכנסתי | נכנס | אכנס | to enter || le-hi-ka-nes - nikh-nas-ti - nikh-nas - e-ka-nes',
// 'להיפגש | נפגשתי | נפגש | אפגש | to meet || le-hi-pa-gesh - nif-gash-ti - nif-gash - e-pa-gesh',
// 'להישאר | נשארתי | נשאר | אשאר | to stay || le-hi-sha-er - nish-ar-ti - nish-ar - e-sha-er',
// 'להכיר | הכרתי | מכיר | אכיר | to know (someone), be familiar with || le-ha-kir - hi-kar-ti - ma-kir - a-kir',
// 'להמליץ | המלצתי | ממליץ | אמליץ | to recommend || le-ham-lits - him-lats-ti - mam-lits - am-lits',
// 'להסביר | הסברתי | מסביר | אסביר | to explain || le-has-bir - his-bar-ti - mas-bir - as-bir',
// 'להסכים | הסכמתי | מסכים | אסכים | to agree || le-has-kim - his-kam-ti - mas-kim - as-kim',
// 'להסתכל | הסתכלתי | מסתכל | אסתכל | to look, watch || le-his-ta-kel - his-ta-kal-ti - mis-ta-kel - es-ta-kel',
// 'להעדיף | העדפתי | מעדיף | אעדיף | to prefer || le-ha-a-dif - he-e-daf-ti - ma-a-dif - a-a-dif',
// 'להפסיק | הפסקתי | מפסיק | אפסיק | to stop || le-haf-sik - hif-sak-ti - maf-sik - af-sik',
// 'להפריע | הפרעתי | מפריע | אפריע | to disturb || le-ha-fri-a - hif-ra-ti - maf-ri-a - af-ri-a',
// 'להצטרך | הייתי צריך | צריך | אצטרך | to need || le-hits-ta-rekh - ha-yi-ti tsa-rikh - tsa-rikh - ets-ta-rekh',
// 'להקשיב | הקשבתי | מקשיב | אקשיב | to listen || le-hak-shiv - hik-shav-ti - mak-shiv - ak-shiv',
// 'להרגיש | הרגשתי | מרגיש | ארגיש | to feel || le-har-gish - hir-gash-ti - mar-gish - ar-gish',
// 'להשיג | השגתי | משיג | אשיג | to obtain || le-ha-sig - hi-sag-ti - ma-sig - a-sig',
// 'להשתמש | השתמשתי | משתמש | אשתמש | to use || le-hish-ta-mesh - hish-ta-mash-ti - mish-ta-mesh - esh-ta-mesh',
// 'להשתתף | השתתפתי | משתתף | אשתתף | to participate || le-hish-ta-tef - hish-ta-taf-ti - mish-ta-tef - esh-ta-tef',
// 'להתחיל | התחלתי | מתחיל | אתחיל | to start || le-hat-khil - hit-khal-ti - mat-khil - at-khil',
// 'להתכוון | התכוונתי | מתכוון | אתכוון | to intend || le-hit-ka-ven - hit-ka-van-ti - mit-ka-ven - et-ka-ven',
// 'להתעמל | התעמלתי | מתעמל | אתעמל | to exercise || le-hit-a-mel - hit-a-mal-ti - mit-a-mel - et-a-mel',
// 'להתקשר | התקשרתי | מתקשר | אתקשר | to phone, call || le-hit-ka-sher - hit-ka-shar-ti - mit-ka-sher - et-ka-sher',
// 'לומר | אמרתי | אומר | אומר | to say || lo-mar - a-mar-ti - o-mer - o-mar',
// 'לזוז | זזתי | זז | אזוז | to move || la-zuz - zaz-ti - zaz - a-zuz',
// 'לזכור | זכרתי | זוכר | אזכור | to remember || liz-kor - za-khar-ti - zo-kher - ez-kor',
// 'לחזור | חזרתי | חוזר | אחזור | to return (come back); repeat || lakh-zor - kha-zar-ti - kho-zer - e-khe-zor',
// 'לחכות | חכיתי | מחכה | אחכה | to wait || le-kha-kot - khi-ki-ti - me-kha-ke - a-kha-ke',
// 'לחנות | חניתי | חונה | אחנה | to park || lakh-not - kha-ni-ti - kho-ne - ekh-ne',
// 'לחפש | חפשתי | מחפש | אחפש | to look for || le-kha-pes - khi-pas-ti - me-kha-pes - a-kha-pes',
// 'לחשוב | חשבתי | חושב | אחשוב | to think || lakh-shov - kha-shav-ti - kho-shev - akh-shov',
// 'לטוס | טסתי | טס | אטוס | to fly || la-tus - tas-ti - tas - a-tus',

});

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

async function playSelected () {
  currentIndex = undefined;
  var selectedCheckboxes = document.querySelectorAll('.sprite input[type="checkbox"]:checked');

  for (let i = 0; i < selectedCheckboxes.length; i++) {
    var spritesObj = selectedCheckboxes[i].getAttribute('data-sprites-obj');
    var spriteKey = selectedCheckboxes[i].getAttribute('data-sprite-key');

    document.querySelector('.playing-sprite')?.classList?.remove('playing-sprite');
    selectedCheckboxes[i].closest('.sprite').classList.add('playing-sprite');
    scrollToItem(selectedCheckboxes[i]);
    
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

var currentAudio;

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

function playAllNew() {
  currentIndex = undefined;
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits(spritesArray.slice(0, spritesArray.length - 2), 0, 1000);
}

function playAllVerbs() {
  currentIndex = undefined;
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits([v1], 0, 1000);
}