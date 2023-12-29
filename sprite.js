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
      
      document.getElementById(key)?.addEventListener('click', function() {
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
      var resolePrmoise = false;
      if (repeat && repeated + 1 >= repeat && index + 1 >= Object.keys(self._spriteMap).length) { 
        resolve('Done');
        console.log('done repeat');
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
];
var spriteMap_2 = [
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
];
var spriteMap_3 = [
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
];
var spriteMap_4 = [
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
debugger
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
    buffer: true,
    sprite: sentences,
    spriteMap: spriteMap,
  });
}
function addAudio (name, time = 1) {
  var sprit = document.createElement('div');
  sprit.setAttribute('id', name);
  sprit.setAttribute('class', 'sprite');
  sprit.innerHTML = `<div class="sprite-label">${name}</div>`;
  spritContainer.appendChild(sprit);
  window[name] = sprit;
  
  return new Sprite({
    src: [name + '.mp3'],
    buffer: true,
    sprite: {
      [name]: [0, time * 1000],
    },
    spriteMap: {
      [name]: name
    }
  });
}

var sprite_5 = addAudioSentances('stupid', {
  'stupid': [0, .9 * 1000],
  'dumb': [1 * 1000, 5 * 1000],
});

var sprite_6 = addAudioSentances('wait wait', {
  'I saw it with my own eyes': [0, 1.31 * 1000],
  'all you do is killing': [1.4 * 1000, 1.5 * 1000],
  'what are you doing here': [3 * 1000, 1.25 * 1000],
  'lier': [4.3 * 1000, .8 * 1000],
  'lies': [5.2 * 1000, .7 * 1000],
  'wait wait': [6 * 1000, 1 * 1000],
});

var sprite_7 = addAudio('smart');
var sprite_8 = addAudio('sure sure');
var sprite_9 = addAudio('I can not read', 2);
var sprite_10 = addAudio('I am sorry', 2);
var sprite_11 = addAudio('do not know what are you talking about', 2);
var sprite_12 = addAudio('what do you mean', 2);


function playAll() {
  document.querySelectorAll('.sprite > .sprite-label').forEach((item, index) => {
    setTimeout(() => {
        item.click();
    }, index * 6000);
  })
}

var spritesArray = [
  // 'sprite_5', 'sprite_6', 'sprite_7', 
  'sprite_12','sprite_11','sprite_10', 'sprite_9', 'sprite_5', 'sprite_6', 'sprite_7', 'sprite_8',  
  'sprite_3', 'sprite_4', 'sprite_1', 'sprite_2', 

]
function playSprits(sprite, index, delay) {
  debugger
  if (index >= sprite.length) {
    return;
  }
  currentAudio = window[sprite[index]];
  window[sprite[index]].playAll(0, 1000).then(() => {
    setTimeout(() => {
      debugger
      playSprits(sprite, index + 1, 2000);
    }, delay);
  });
}
var currentAudio;
function playAll2() {
  currentAudio?.sound?.stop();
  playSprits(spritesArray, 0, 500);
}
function pauseAudio() {
  currentAudio?.sound?.pause();
}
function resumeAudio() {
  currentAudio?.sound?.play();
}