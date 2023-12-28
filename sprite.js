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
  self.setupListeners();

  // Create our audio sprite definition.
  self.sound = new Howl({
    src: options.src,
    sprite: options.sprite
  });

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
      window[key]?.addEventListener('click', function() {
        self.play(key);
      }, false);
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
  playAll: function(index = 0, delay, repeat, repeated = 0) {
    var self = this;
    return new Promise((resolve) => {
      if (repeat && repeated + 1 >= repeat && index + 1 >= Object.keys(self._spriteMap).length) { 
        resolve('Done');
      } else if (!repeat && index + 1 >= Object.keys(self._spriteMap).length) {
        resolve('Done');
      }
        var id = self.play(Object.keys(self._spriteMap)[index]);
        self.sound.once('end', function() {
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


var elms = [
  'Good morning.',
  'Good evening.',
  'Good night.',
  'Thank you very much.',
  'You\'re welcome.',
  'Let\'s go.',
  'How are you?',
  'What\'s up?',
  'What\'s going on?',
  'I\'m fine.',
  'Nice to meet you.',
  'I speak a little Hebrew.',
  'Please correct my Hebrew mistakes.',
  'I don\'t understand.',
  'Could you repeat that?',
  'What did you say?',
  'What\'s your name?',
  'My name is…',
  'Where are you from?',
  'I\'m from the US.',
  'Where do you live?',
  'I live in Tel Aviv.',
  'How long have you been in Israel?',
  'I\'ve been in Israel for one and a half years.',
  'How long do you intend to stay in Israel?',

  'I\'m staying in Israel for two years.',
  'I need to go now.',
  'How old are you?',
  'I\'m…years old.',
  'Are you married?',
  'I\'m married.',
  'I\'m single.',
  'Do you have children?',
  'We don\'t have any children.',
  'We have three kids.',
  'Why are you in Israel?',
  'I\'m here for ten days.',
  'I work at…',
  'I\'m studying…',
  'When do you go back to the US?',
  'What is that?',
  'What\'s wrong?',
  'It doesn\'t matter.',
  'I have no idea.',
  'I\'m tired.',
  'I\'m hungry.',
  'I\'m sick.',
  'I don\'t feel well.',
  'I\'m thirsty.',
  'I\'m hot.',
  'I\'m cold.',
  'I\'m bored.',
  'Good luck. (literally: with success)',
  'Congratulations. (literally: good luck)',
  'I forgot.',
  'No problem.',
  'Don\'t worry.',
  'Is this the bus to…?',
  'Is this the train to…?',
  'Stop here, please. (to taxi driver)',
  'What time is it?',
  'Has bus number 123 come by yet?',
  'I don\'t know.',
  'Come here.',
  'Good job/Well done. [all the respect]',
  'It\'s beautiful here.',
  'The weather is nice today.',
  'It\'s very hot today.',
  'That\'s mine.',
  'No smoking. (forbidden to smoke)',
  'I want to go to the beach.',
  'What\'s your phone number?',
  'What\'s your email address?',
  'Tell me.',
  'What time do you open?',
  'What time do you close?',
  'Could you take my picture, please?',
  'It\'s too expensive.',
  'I\'m just looking.',
  'Do you have…? (at a store)',
  'I\'m (not) Jewish.',
  'I\'m religious.',
  'I\'m secular.',
  'I\'m vegetarian.',
  'How much does it cost?',
  'Can I pay by credit card?',
  'Cash only.',
  'Is this kosher?',
  'Want to drink a beer with me this evening?',
  'Can I help you?',
  'Are you ready to order?',
  'Are you ready?',
  'Do you want something to drink?',
  'Who has the best hummus in Israel?',
  'A glass of water please.',
  'Anything else?',
  'Check, please.',
  'Can you break this? (big bill into smaller bills)',
  'Where\'s the restroom?',
  'Same thing.',
  'I need to practice my Hebrew.'
];
var spriteMap = {};
elms.forEach((item, index) => {
  spriteMap['sprite' + index] = item;
});
var spritContainer = document.querySelector('.sprites');
Object.keys(spriteMap).forEach(function(key, index) {
  var sprit = document.createElement('div');
  sprit.setAttribute('id', key);
  sprit.setAttribute('class', 'sprite');
  sprit.innerHTML = `<div class="sprite-label">${index + 1}. ${spriteMap[key]}</div>`;
  spritContainer.appendChild(sprit);
  if ((index + 1) % 25 == 0) {
    var hr = document.createElement('hr');
    spritContainer.appendChild(hr);
  }
  window[key] = sprit;
});

// Setup our new sprite class and pass in the options.

var sprite = new Sprite({
  src: ['100_phrases_1-25.mp3'],
  sprite: {
    [elms[0]]: [0, 4 * 1000],
    [elms[1]]: [4 * 1000, 5 * 1000],
    [elms[2]]: [9 * 1000, 5 * 1000],
    [elms[3]]: [13.7 * 1000, 4.9 * 1000],
    [elms[4]]: [18 * 1000, 5 * 1000],
    [elms[5]]: [23 * 1000, 5 * 1000],

    [elms[6]]: [28 * 1000, 5 * 1000],
    [elms[7]]: [38 * 1000, 5 * 1000],
    [elms[8]]: [42 * 1000, 5 * 1000],
    [elms[9]]: [56.5 * 1000, 5 * 1000],
    [elms[10]]: [61.7 * 1000, 5 * 1000],
    [elms[11]]: [66.8 * 1000, 7 * 1000],
    [elms[12]]: [82 * 1000, 9 * 1000],
    [elms[13]]: [91 * 1000, 6 * 1000],
    [elms[14]]: [103 * 1000, 7 * 1000],
    [elms[15]]: [116 * 1000, 5 * 1000],
    [elms[16]]: [127 * 1000, 4 * 1000],
    [elms[17]]: [146 * 1000, 2 * 1000],
    [elms[18]]: [152.8 * 1000, 5 * 1000],
    [elms[19]]: [162 * 1000, 7 * 1000],
    [elms[20]]: [169 * 1000, 5 * 1000],
    [elms[21]]: [180 * 1000, 6 * 1000],
    [elms[22]]: [194 * 1000, 7 * 1000],
// new file
    // [elms[23]]: [13.7 * 1000, 4.9 * 1000],
    // [elms[24]]: [18 * 1000, 5 * 1000],
    // [elms[25]]: [23 * 1000, 5 * 1000],
  },
  spriteMap: spriteMap
});

var sprite_2 = new Sprite({
  src: ['100_phrases_26-50.mp3'],
  sprite: {
    [elms[25]]: [0, 8 * 1000],
    [elms[26]]: [16 * 1000, 7 * 1000],
    [elms[27]]: [31 * 1000, 5 * 1000],

    [elms[28]]: [41 * 1000, 2 * 1000],
    [elms[29]]: [47 * 1000, 9 * 1000],
    [elms[30]]: [57 * 1000, 5 * 1000],

    [elms[31]]: [67 * 1000, 5 * 1000],
    [elms[32]]: [78 * 1000, 5 * 1000],
    [elms[33]]: [84 * 1000, 5 * 1000],
    [elms[34]]: [89.5 * 1000, 7 * 1000],
    [elms[35]]: [96 * 1000, 5 * 1000],
    [elms[36]]: [108 * 1000, 5 * 1000],

    [elms[37]]: [114 * 1000, 5 * 1000],
    [elms[38]]: [125 * 1000, 5 * 1000],
    [elms[39]]: [135 * 1000, 7 * 1000],
    [elms[40]]: [150 * 1000, 4 * 1000],

    [elms[41]]: [154 * 1000, 4 * 1000],
    [elms[42]]: [158 * 1000, 4 * 1000],
    [elms[43]]: [162 * 1000, 5 * 1000],
    [elms[44]]: [168 * 1000, 4 * 1000],
    [elms[45]]: [177.5 * 1000, 4 * 1000],
    [elms[46]]: [187 * 1000, 4 * 1000],
    [elms[47]]: [196.7 * 1000, 5 * 1000],
    [elms[48]]: [209 * 1000, 4 * 1000],
    [elms[49]]: [218.5 * 1000, 4 * 1000],
  },
  spriteMap: spriteMap
});

var sprite_3 = new Sprite({
  src: ['100_phrases_51-75.mp3'],
  sprite: {
    [elms[50]]: [0, 4 * 1000],
    [elms[51]]: [4 * 1000, 4 * 1000],
    [elms[52]]: [15 * 1000, 2 * 1000],

    [elms[53]]: [16.8 * 1000, 5 * 1000],
    [elms[54]]: [23 * 1000, 2 * 1000],
    [elms[55]]: [25 * 1000, 4 * 1000],

    [elms[56]]: [30 * 1000, 3.5 * 1000],
    [elms[57]]: [34 * 1000, 7 * 1000],
    [elms[58]]: [41 * 1000, 6 * 1000],
    [elms[59]]: [47 * 1000, 6 * 1000],

    [elms[60]]: [53 * 1000, 5 * 1000],
    [elms[61]]: [58 * 1000, 10 * 1000],

    [elms[62]]: [69 * 1000, 5 * 1000],
    [elms[63]]: [79.7 * 1000, 4 * 1000],
    [elms[64]]: [84 * 1000, 5 * 1000],
    [elms[65]]: [89 * 1000, 5 * 1000],

    [elms[66]]: [94 * 1000, 7 * 1000],
    [elms[67]]: [101.7 * 1000, 5 * 1000],

    [elms[68]]: [107 * 1000, 5 * 1000],
    [elms[69]]: [112 * 1000, 5 * 1000],
    [elms[70]]: [117 * 1000, 7.4 * 1000],
    [elms[71]]: [133 * 1000, 7.5 * 1000],
    [elms[72]]: [148 * 1000, 6 * 1000],
    [elms[73]]: [160 * 1000, 4 * 1000],
    [elms[74]]: [169 * 1000, 8 * 1000],
  },
  spriteMap: spriteMap
});

var sprite_4 = new Sprite({
  src: ['100_phrases_76-100.mp3'],
  sprite: {
    [elms[75]]: [0, 6 * 1000],
    [elms[76]]: [6 * 1000, 7 * 1000],
    [elms[77]]: [21 * 1000, 5 * 1000],

    [elms[78]]: [26 * 1000, 5 * 1000],
    [elms[79]]: [37 * 1000, 5 * 1000],
    [elms[80]]: [42 * 1000, 5.7 * 1000],

    [elms[81]]: [53.8 * 1000, 4 * 1000],
    [elms[82]]: [62 * 1000, 5 * 1000],

    [elms[83]]: [72 * 1000, 5 * 1000],
    [elms[84]]: [83 * 1000, 5 * 1000],

    [elms[85]]: [89 * 1000, 7 * 1000],
    [elms[86]]: [97 * 1000, 6 * 1000],

    [elms[87]]: [103 * 1000, 5 * 1000],
    [elms[88]]: [108 * 1000, 8 * 1000],
    [elms[89]]: [127 * 1000, 6 * 1000],
    [elms[90]]: [140 * 1000, 5 * 1000],

    [elms[91]]: [145.5 * 1000, 4 * 1000],
    [elms[92]]: [153.8 * 1000, 5.6 * 1000],

    [elms[93]]: [166.5 * 1000, 7.4 * 1000],
    [elms[94]]: [174.5 * 1000, 4.8 * 1000],
    [elms[95]]: [180 * 1000, 4.3 * 1000],
    [elms[96]]: [184.3 * 1000, 4 * 1000],
    [elms[97]]: [189 * 1000, 5 * 1000],
    [elms[98]]: [195 * 1000, 4 * 1000],
    [elms[99]]: [199.8 * 1000, 5 * 1000],
    [elms[100]]: [205 * 1000, 7 * 1000],
  },
  spriteMap: spriteMap
});

// var sprit = document.createElement('div');
// sprit.setAttribute('id', 'stupid');
// sprit.setAttribute('class', 'sprite');
// sprit.innerHTML = `<div class="sprite-label">stupid</div>`;
// spritContainer.appendChild(sprit);
// window['stupid'] = sprit;

// sprit = document.createElement('div');
// sprit.setAttribute('id', 'dumb');
// sprit.setAttribute('class', 'sprite');
// sprit.innerHTML = `<div class="sprite-label">dumb</div>`;
// spritContainer.appendChild(sprit);
// window['dumb'] = sprit;

// var sprite2 = new Sprite({
//   src: ['stupid.mp3'],
//   sprite: {
//     ['stupid']: [0, .8 * 1000],
//     ['dumb']: [1 * 1000, 5 * 1000],
//   },
//   spriteMap: {
//     'stupid': 'stupid',
//     'dumb': 'dumb'
//   }
// });
function addAudioSentances(name, sentences) {
  var spriteMap = {};
  Object.keys(sentences).forEach((key) => {
    var sprit = document.createElement('div');
    sprit.setAttribute('id', key);
    sprit.setAttribute('class', 'sprite');
    sprit.innerHTML = `<div class="sprite-label">${key}</div>`;
    spritContainer.appendChild(sprit);
    window[key] = sprit;
    spriteMap[key] = key;
  });
  return new Sprite({
    src: [name + '.mp3'],
    sprite: sentences,
    spriteMap: spriteMap,
  });
}
function addAudio (name) {
  var sprit = document.createElement('div');
  sprit.setAttribute('id', name);
  sprit.setAttribute('class', 'sprite');
  sprit.innerHTML = `<div class="sprite-label">${name}</div>`;
  spritContainer.appendChild(sprit);
  window[name] = sprit;
  
  return new Sprite({
    src: [name + '.mp3'],
    sprite: {
      [name]: [0, 1 * 1000],
    },
    spriteMap: {
      [name]: name
    }
  });
}

var sprite2 = addAudioSentances('stupid', {
  'stupid': [0, .8 * 1000],
  'dumb': [1 * 1000, 5 * 1000],
});

var sprite5 = addAudioSentances('wait wait', {
  'I saw it with my own eyes': [0, 1.4 * 1000],
  'all you do is killing': [1.4 * 1000, 1.5 * 1000],
  'what are you doing here': [3 * 1000, 1.3 * 1000],
  'lier': [4.3 * 1000, .8 * 1000],
  'lies': [5.2 * 1000, .7 * 1000],
  'wait wait': [6 * 1000, 1 * 1000],
});

var s3 = addAudio('smart');
var s4 = addAudio('sure sure');

// wait wait.mp3
// sprite.playAll(0, 1000, 2)

// sprite2.playAll(0, 500, 2).then(() => {
//   setTimeout(() => {
//     s3.playAll(0, 100, 2).then(() => {
//       console.log('done');
//     });
//   }, 1000);
// });

function playAll() {
  document.querySelectorAll('.sprite > .sprite-label').forEach((item, index) => {
    setTimeout(() => {
        item.click();
    }, index * 6000);
  })
}