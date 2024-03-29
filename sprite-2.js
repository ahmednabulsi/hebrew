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
        localStorage.setItem('sprites2', JSON.stringify(items));
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

var s13 = addAudioSentances('s13', 's13', {
  'ישראל מלחמת מלחמה שאין צודקת ממנה': [ 0 * 1000, 3.87 * 1000 ],
  'אנחנו נלחמים נגד מפלצות החמאס': [ 4 * 1000, 2.75 * 1000 ],
  'שרצחו אנסו ערפו וחטפו את אזרחנו': [ 7 * 1000, 3.63 * 1000 ],
  'אנחנו נמשיך לעשות הכל': [ 11.14 * 1000, 2.1 * 1000 ],
  'כדי להגן על עצמנו ועל אזרחינו': [ 13.32 * 1000, 2.4 * 1000 ],
  'תוך שמירה על הדין הבינלאומי': [ 15.8 * 1000, 2.15 * 1000 ],
  'כמו לכל מדינה': [ 18 * 1000, 1.5 * 1000 ],
  // 'לישראל יש את הזכות הבסיסית להגנה עצמית': [ 19.7 * 1000, 3 * 1000 ],
  // 'בית הדין בהג דחה בצדק את הדרישה המקוממת': [ 23 * 1000, 3.27 * 1000 ],
});
sentanceIndex = 1;

var s10 = addAudioSentances('s10', 's10', {
  'ממשלה מושחתת - Corrupt government': [ 0 * 1000, 1.35 * 1000 ],
  'סערת התרופות - عاصفة المخدرات': [ 1.4 * 1000, 1.42 * 1000 ],
  'דמותו של מנהיג - شخصية القائد': [ 2.87 * 1000, 1.33 * 1000 ],
  'בית ריק - بيت فارغ': [ 4.26 * 1000, 0.9 * 1000 ],
  'נסה את זה לערב שלם - جربه لأمسية كاملة': [ 5.23 * 1000, 1.7 * 1000 ],
  'לא יקרה שוב - Won\'t happen again': [ 7 * 1000, 1.3 * 1000 ],
  'תפתח את החלון חם פה - Open the window (male)': [ 8.33 * 1000, 1.88 * 1000 ],
  'הצבעים - The colors': [ 10.36 * 1000, .85 * 1000 ],
  'נדבר על זה מחר בערב - We\'ll talk about it tomorrow night': [ 11.26 * 1000, 2 * 1000 ],
  'אני כל כך רעב - I\'m so hungry': [ 13.34 * 1000, 1.32 * 1000 ],
  'תמיד אני אומר לכם. - I always tell you (plural).': [ 14.8 * 1000, 1.33 * 1000 ],
  'אני רוצה להיפרד לפני מותי - I want to say goodbye before I die': [ 16.2 * 1000, 1.95 * 1000 ],
  'אני כל כך חולה אני רוצה לישון - I\'m so sick I want to sleep': [ 18.3 * 1000, 2.2 * 1000 ],
  'תסבירי למה - explain why': [ 20.7 * 1000, 1.04 * 1000 ],
  'בלי להסס - without hesitation': [ 21.8 * 1000, 1.1 * 1000 ],
  'חייב להשתנות - must change': [ 23 * 1000, 1.2 * 1000 ],
  'עם ביטוחים פרטיים - with private insurances': [ 24.3 * 1000, 1.4 * 1000 ],
  'אתה לא יודע לאן אתה הולך - you don\'t know where you are going': [ 25.8 * 1000, 1.87 * 1000 ],
  ' Proved now - הוכח עכשיו - ثبت الآن': [ 27.9 * 1000, 1 * 1000 ],
  'אנחנו יודעים - نحن نعلم': [ 29 * 1000, 1 * 1000 ],
  'לדבר על זה. - To talk about it': [ 30 * 1000, 1 * 1000 ],
  'אנשים. - People': [ 31 * 1000, 0.72 * 1000 ],
  'איך את יודעת - كيف علمتي بذلك ؟': [ 31.84 * 1000, 1 * 1000 ],
  'איך אתה יודע - كيف علمت بذلك ؟': [ 32.92 * 1000, 1 * 1000 ],
  'לחלוטין - تماما او بالزبط': [ 33.95 * 1000, 0.88 * 1000 ],
});
sentanceIndex = 1;

var s9 = addAudioSentances('s9', 's9', {
  'Tell him not to forget to bring food - תגיד לו שלא ישכח להביא אוכל': [ 0 * 1000 , 2 * 1000],
});
sentanceIndex = 1;

var s8 = addAudioSentances('s8', 's8', {
  'انا بأفضل حال - .שלומי מצויין' : [ 0 * 1000, 1.17 * 1000 ],
  'You should try to think about other people  - .צריך לנסות לחשוב גם על אנשים אחרים' : [ 1.2 * 1000, 3 * 1000 ],
  'I don\'t want to leave the house - .אני לא רוצה לעזוב הבית' : [ 4.26 * 1000, 1.83 * 1000 ],
  'لا تترك الدرابزين - .אל תעזוב את מעקה' : [ 6.2 * 1000, 1.57 * 1000 ],
  'Open the window (asking female) - .תפתחי את החלון חם פה' : [ 7.8 * 1000, 1.85 * 1000 ],
  'The way home is very long - .הדרך הביתה ארוכה מאוד' : [ 9.83 * 1000, 2 * 1000 ],
  'I went with my friend to the movie - .הלכתי עם החבר שלי הסרט' : [ 12 * 1000, 2.13 * 1000 ],
  'الى اين انت ذاهب؟ - .לאן אתה הולך?' : [ 14.24 * 1000, 1.25 * 1000 ],
  '.קוראים לי אחמד - Informal اسمي أحمد' : [ 15.56 * 1000, 1.2 * 1000 ],
  'I grew up in Nablus - .גדלתי בשכם' : [ 16.8 * 1000, 1.18 * 1000 ],
  'i\'m sleepy - .אני ישנוני' : [ 18 * 1000, 0.83 * 1000 ],
  'إحدى هواياتي هي القراءة - .אחד התחביבים שלי הוא קריאה' : [ 18.94 * 1000, 2 * 1000 ],
  'أنا أستمتع بسماع الموسيقى - .אני נהנה להאזין למוזיקה' : [ 21 * 1000, 2 * 1000 ],
  'My house is at the end of the street - .הבית שלי נמצא בקצה הרחוב' : [ 23.14 * 1000, 2.36 * 1000 ],
  'جدتي لديها حساب على الفيسبوك - .הסבתא שלי יש חשבון פייסבוק' : [ 25.65 * 1000, 2.5 * 1000 ],
  'Try it - .נסה את זה' : [ 28.25 * 1000, 0.9 * 1000 ],
});
sentanceIndex = 1;

var s11 = addAudioSentances('s11.1', 's11', {
  'בכמה אתה מוכר את המכונית. - How much are you selling the car for?': [18.72 * 1000, 1.84 * 1000],
  'בכמה אתה קונה את זה?. - For how much do you buy it?': [20.77 * 1000, 1.44 * 1000],

  'אתם בורחים מהאמת. - أنتم تهرب من الحقيقة': [0 * 1000, 1.34 * 1000],
  'מה דעתך. - ما رأيك': [1.37 * 1000, 0.9 * 1000],
  'בְּהֶחלֵט מסכימ. - Definitely agree': [2.3 * 1000, 1.3 * 1000],
  'אני שמח לשמוע. - I\'m glad to hear': [3.67 * 1000, 1.3 * 1000],
  'מה פתאום. - No way (you are kidding)': [5 * 1000, 0.9 * 1000],
  'יהיה בסדר. - It will be OK': [5.9 * 1000, 1.2 * 1000],
  'ללכת עם הזרם. - Go with the flow': [7.2 * 1000, 1.33 * 1000],
  'קצת סבלנות. - A little patience': [8.6 * 1000, 1 * 1000],
  'תשכח מזה. - Forget about it': [9.7 * 1000, 1 * 1000],
  'סערה בכוס מים. - Making a big deal out of nothing (storm in a cup)': [10.74 * 1000, 1.5 * 1000],
 // 'אתה עושה סערה בכוס מים. - Making a big deal out of nothing (storm in a cup)': [12.3 * 1000, 1.9 * 1000],
  'כל דיבורים. - It’s all talk': [14.36 * 1000, 1 * 1000],
  'השם ישמור. - لا سمح الله': [15.47 * 1000, 1.14 * 1000],
  'בעזרת השם. - بعون ​​الله': [16.64 * 1000, 1.2 * 1000],
  'לכ על זה. - go for it': [17.87 * 1000, 0.8 * 1000],
  'בכמה קנית את זה?. - For how much did you buy it?': [22.38 * 1000, 1.4 * 1000],
});

sentanceIndex = 1;

var s12 = addAudioSentances('s12', 's12', {
  'הם מתכננים לבוא שוב. - إنهم يخططون للمجيء مرة أخرى.': [ 0 * 1000, 1.6 * 1000],
  'ראשם לא יורד. - رؤوسهم لا تنخفض.': [ 1.62 * 1000, 1.18 * 1000],
  'למדינה אכפת מלחמה. - البلاد تهتم بالحرب.': [ 2.83 * 1000, 1.83 * 1000],
  'משפחה מוחלשת - عائلة ضعيفة': [ 4.7 * 1000, 1.38 * 1000],
  'אין להם כסף - ليس لديهم المال': [ 6.11 * 1000, 1.26 * 1000],
  'אני גם עורך דין - أنا أيضًا محامٍ': [ 7.4 * 1000, 1.22 * 1000],
  'זה הזמן לממש אותם - هذا هو الوقت المناسب لتحقيقها': [ 8.66 * 1000, 1.73 * 1000],
  'שלחתי לו הודעה. - I sent him a message.': [ 10.45 * 1000, 1.22 * 1000],
  'שלחתי לה הודעה. - I sent her a message': [ 11.7 * 1000, 1.3 * 1000],
  'ויותר קל להחזיר חטופים. - And it’s easier to return the hostages': [ 13 * 1000, 2.2 * 1000],
  'לא הבנתי בכלל. - لم أفهم على الإطلاق': [ 15.26 * 1000, 1.26 * 1000],
  'לא הולך ביחד - does not go together غير متوافقين': [ 16.57 * 1000, 1.26 * 1000],
  // 'צריך היום ללכת להסכם עם. - نحن بحاجة إلى التوصل إلى اتفاق اليوم مع': [ 17.87 * 1000, 2.17 * 1000],
  'צריך היום ללכת להסכם עם ישראל. - نحن بحاجة للتوصل إلى اتفاق مع إسرائيل اليوم.': [ 20.15 * 1000, 2.6 * 1000],
  'בחשש היותר בגדול. - with greater fear': [ 22.84 * 1000, 1.84 * 1000],
  'שאי אפשר גם למוטט החמאס. - وأنه من المستحيل أيضًا انهيار حماس': [ 24.72 * 1000, 2.3 * 1000],
  'באה שבת באה מנוחה. - السبت يأتي، والراحة تأتي': [ 27.12 * 1000, 1.73 * 1000],
  // 'משפחה מוחלשת. - عائلة ضعيفة': [ 28.88 * 1000, 1.4 * 1000],
  // 'אין להם כסף. - ليس لديهم المال': [ 30.3 * 1000, 1.24 * 1000],
  // 'אני גם עורך דין. - أنا أيضًا محامٍ': [ 31.6 * 1000, 1.24 * 1000],
});

sentanceIndex = 1;

var s6 = addAudioSentances('s6', 's6', {
  'the smartest. - הכי חכם.': [ 0 * 1000 , 1.1 * 1000],
  'The biggest house. - הבית הגדול ביותר.': [ 1.1 * 1000 , 1.9 * 1000],
  'It\'s really you in the picture. - זה באמת אתה בתמונה.': [ 3 * 1000 , 1.65 * 1000],
  'Really good. - ממש טוב.': [ 4.7 * 1000 , 1.12 * 1000],
  'Definately not. - ממש לא.': [ 5.9 * 1000 , 0.96 * 1000],
  'What do you think. - מה אתם חושבים.': [ 6.9 * 1000 , 1.4 * 1000],
});
sentanceIndex = 1;

var s7 = addAudioSentances('s7', 's7', {
  'go in circles - ללכת במעגלים.' : [ 0  * 1000, 1.5 * 1000],
  // 'In the language of warriors to brag in the field. - בשפת הלוחמים להתברבר בשטח.' : [ 1.55  * 1000, 2.9 * 1000],
  'You didn\'t even know what you were doing? . - כלל לא ידעת מה אתה עושה? .' : [ 4.5  * 1000, 1.9 * 1000],
  'the strongest man in the world. - האיש החזק בעולם.' : [ 6.5  * 1000, 1.9 * 1000],
  'I want ice cream. - בא לי גלידה. ' : [  8.4 * 1000, 1.1 * 1000],
  // 'enough. - די.' : [   * 1000, 1 * 1000],
  'Excellent. - מעולה.' : [ 10.24  * 1000, 0.8 * 1000],
  'This show is great. - ההופעה הזאת מעולה.' : [ 11  * 1000, 1.8 * 1000],
  'How was the trip?. it was great. - איך היה הטיול؟. היה מעולה.' : [ 12.9  * 1000, 2.37 * 1000],
  'Welcome. - ברוך הבא.' : [ 15.3  * 1000, 1.1 * 1000],
  'come in please - כנס בבקשה.' : [ 16.4  * 1000, 1.4 * 1000],
  'my foot - כף רגל שלי.' : [ 17.82  * 1000, 1.23 * 1000],
  'Are you planning to come? - אתה מתכנן לבוא؟.' : [ 19  * 1000, 1.35 * 1000],
  'go home. - ללכת הביתה.' : [ 20.44  * 1000, 1.38 * 1000],
  'to walk. - ללכת ברגל.' : [ 21.86  * 1000, 1.43 * 1000],
  'go for a trip. - ללכת לטיול.' : [  23.3 * 1000, 1.39 * 1000],
  'I want to tell you something. - אני רוצה להגיד לך משהו.' : [ 24.7  * 1000, 2 * 1000],
  'What you want?. - מה אתה רוצה؟.' : [  26.8 * 1000, 1.2 * 1000],
  'Don\'t make a big deal. - אל תעשה עניין.' : [ 28  * 1000, 1.4 * 1000],
  'I had a headache so I took a pill. - היה לי כאב ראש אז לקחתי כדור.' : [ 29.46  * 1000, 2.54 * 1000],
  'what are you saying?. - מה אתה אומר?.' : [ 32  * 1000, 1.2 * 1000],
  'I want to be a doctor. - אני רוצה להיות רופא.' : [ 33.36 * 1000, 1.63 * 1000],
  'I wanted to give you a present. - רציתי לתת לך מתנה.' : [ 35  * 1000, 1.75 * 1000],
  'Are you planning to come? - אתה מתכנן לבוא؟.' : [  36.82 * 1000, 1.36 * 1000], 
});
sentanceIndex = 1;

var s3 = addAudioSentances('s3', 's3', {
  'شو اخبارك ؟. - מה העניינים. ' : [ 0 * 1000, 1.16 * 1000 ],
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
sentanceIndex = 1;

var s4 = addAudioSentances('s4', 's4', {
  'This ice cream is really good. - הגלידה הזאת ממש טובה.': [ 0 * 1000, 1.95 * 1000 ],
  'The concert was great. - הקונצרט היה נהדר.': [ 1.95 * 1000, 1.95 * 1000 ],
  'This falafel is not bad at all. - הפלאפל הזה לא רע בכלל.': [ 4 * 1000, 2.2 * 1000 ],
  'can i have water please - אפשר לקבל מים בבקשה.': [ 6.3 * 1000, 2.2 * 1000 ],
  'wait in line - לחכות בתור.': [ 8.5 * 1000, 1.44 * 1000 ],
  'I waited hours in line for falafel. - חיכיתי שעות בתור לפלאפל.': [ 9.96 * 1000, 2.4 * 1000 ],
  'I have no money, I can\'t buy anything. - אין לי כסף אני לא יכול לקנות כלום.': [ 12.38 * 1000, 2.55 * 1000 ],
  'how could i know - איך הייתי יכול לדעת. ': [ 15 * 1000, 1.9 * 1000 ],
  'what is your apartment number - מה מספר הדירה שלך.': [ 17 * 1000, 1.88 * 1000 ],
  'Cats are mighty and that\'s a fact. - חתולים הם אדירים וזאת עובדה.': [ 18.87 * 1000, 2.4 * 1000 ],
  'I can fix your computer. - אני יכול לתקן לך את המחשב.': [ 21.4 * 1000, 2.33 * 1000 ],
  'you make a mess - אתה עושה בלאגן.': [ 23.8 * 1000, 1.6 * 1000 ],
});
sentanceIndex = 1;

var s5 = addAudioSentances('biggest lier', 's5', {
  'The most liar in the world. - האיש הכי שַׁקְרָן בעולם.': [ 0 * 1000, 1.95 * 1000 ],
});

sentanceIndex = 1;


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
sentanceIndex = 1;

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
  var selectedSprites = JSON.parse(localStorage.getItem('sprites2')) || {};
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
  playSprits(spritesArray.slice(0, spritesArray.length - 1), 0, 1500);
}

function playNew() {
  currentIndex = undefined;
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits([s11], 0, 1500);
}

function playNewS12() {
  currentIndex = undefined;
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits([s12], 0, 1500);
}

function playAllVerbs() {
  currentIndex = undefined;
  clearTimeout(playingTimerId)
  clearTimeout(Sprite.CurrentTimerId);
  Howler.stop();
  // shuffleArray(spritesArray);
  playSprits([v1], 0, 1000);
}