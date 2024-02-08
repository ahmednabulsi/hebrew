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
        localStorage.setItem('sprites_en', JSON.stringify(items));
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



var en48 = addAudioSentances('Any final thoughts before we close the meeting', 'Any final thoughts before we close the meeting', {
  'Any final thoughts before we close the meeting': [0 * 1000,  3 * 1000],
});
var en49 = addAudioSentances('Are there any objections to what I covered', 'Are there any objections to what I covered', {
  'Are there any objections to what I covered': [0 * 1000,  3 * 1000],
});

var en37 = addAudioSentances('I’d like to welcome everyone', 'I’d like to welcome everyone', {
  'I’d like to welcome everyone': [0 * 1000,  3 * 1000],
});
var en38 = addAudioSentances('Since everyone is here, let’s get started', 'Since everyone is here, let’s get started', {
  'Since everyone is here, let’s get started': [0 * 1000,  3 * 1000],
});
var en39 = addAudioSentances('I’d like to thank everyone for coming today', 'I’d like to thank everyone for coming today', {
  'I’d like to thank everyone for coming today': [0 * 1000,  3 * 1000],
});
var en40 = addAudioSentances('I’ve called this meeting in order to', 'I’ve called this meeting in order to', {
  'I’ve called this meeting in order to': [0 * 1000,  3 * 1000],
});
var en41 = addAudioSentances('We’re here today to discuss', 'We’re here today to discuss', {
  'We’re here today to discuss': [0 * 1000,  3 * 1000],
});
var en42 = addAudioSentances('Today I would like to outline our plans for', 'Today I would like to outline our plans for', {
  'Today I would like to outline our plans for': [0 * 1000,  3 * 1000],
});
var en43 = addAudioSentances('Sorry, but just to clarify', 'Sorry, but just to clarify', {
  'Sorry, but just to clarify': [0 * 1000,  3 * 1000],
});
var en44 = addAudioSentances('Sorry I didn’t quite hear that, can you say it again', 'Sorry I didn’t quite hear that, can you say it again', {
  'Sorry I didn’t quite hear that, can you say it again': [0 * 1000,  3 * 1000],
});
var en45 = addAudioSentances('Excuse me for interrupting', 'Excuse me for interrupting', {
  'Excuse me for interrupting': [0 * 1000,  3 * 1000],
});
var en46 = addAudioSentances('Are there any more comments', 'Are there any more comments', {
  'Are there any more comments': [0 * 1000,  3 * 1000],
});
var en47 = addAudioSentances('To sum up what I’ve presented', 'To sum up what I’ve presented', {
  'To sum up what I’ve presented': [0 * 1000,  3 * 1000],
});

var en10 = addAudioSentances('to conclude, we have decided on', 'to conclude, we have decided on.', {
  'to conclude, we have decided on.': [0 * 1000,  3 * 1000],
});
var en11 = addAudioSentances('That just about covers everything for today', 'That just about covers everything for today', {
  'That just about covers everything for today': [0 * 1000,  3 * 1000],
});
var en12 = addAudioSentances('We have covered everything from our agenda', 'We have covered everything from our agenda', {
  'We have covered everything from our agenda': [0 * 1000,  3 * 1000],
});
var en13 = addAudioSentances('We will have to finish here, but our next meeting will be scheduled for', 'We will have to finish here, but our next meeting will be scheduled for', {
  'We will have to finish here, but our next meeting will be scheduled for': [0 * 1000,  4 * 1000],
});
var en14 = addAudioSentances('If there’s nothing more to discuss, we can end here', 'If there’s nothing more to discuss, we can end here', {
  'If there’s nothing more to discuss, we can end here': [0 * 1000,  3 * 1000],
});
var en15 = addAudioSentances('I would like to thank everyone for coming today', 'I would like to thank everyone for coming today', {
  'I would like to thank everyone for coming today': [0 * 1000,  3 * 1000],
});
var en16 = addAudioSentances('Thank you all for your time', 'Thank you all for your time', {
  'Thank you all for your time': [0 * 1000,  3 * 1000],
});
var en17 = addAudioSentances('Thank you for your participation in today’s meeting', 'Thank you for your participation in today’s meeting', {
  'Thank you for your participation in today’s meeting': [0 * 1000,  3 * 1000],
});
var en18 = addAudioSentances('I want to thank everybody for a productive meeting', 'I want to thank everybody for a productive meeting', {
  'I want to thank everybody for a productive meeting': [0 * 1000,  3 * 1000],
});
var en19 = addAudioSentances('I would like to thank you all for sharing your time today', 'I would like to thank you all for sharing your time today', {
  'I would like to thank you all for sharing your time today': [0 * 1000,  3 * 1000],
});
var en20 = addAudioSentances('Let me put this another way', 'Let me put this another way', {
  'Let me put this another way': [0 * 1000,  3 * 1000],
});
var en21 = addAudioSentances('Here’s what I had in mind', 'Here’s what I had in mind', {
  'Here’s what I had in mind': [0 * 1000,  3 * 1000],
});
var en22 = addAudioSentances('What I’m saying is that', 'What I’m saying is that', {
  'What I’m saying is that': [0 * 1000,  3 * 1000],
});
var en23 = addAudioSentances('My idea was', 'My idea was', {
  'My idea was': [0 * 1000,  3 * 1000],
});
var en24 = addAudioSentances('Just to clarify', 'Just to clarify', {
  'Just to clarify': [0 * 1000,  3 * 1000],
});
var en25 = addAudioSentances('In a nutshell, what I’m saying is', 'In a nutshell, what I’m saying is', {
  'In a nutshell, what I’m saying is': [0 * 1000,  3 * 1000],
});
// var en26 = addAudioSentances('I’m sorry, could you repeat that please', 'I’m sorry, could you repeat that please?', {
//   'I’m sorry, could you repeat that please?': [0 * 1000,  3 * 1000],
// });
var en27 = addAudioSentances('Can you run that by me one more time, please', 'Can you run that by me one more time, please?', {
  'Can you run that by me one more time, please?': [0 * 1000,  3 * 1000],
});
var en28 = addAudioSentances('I’m afraid I didn’t quite understand that Could you say it one more time, please', 'I’m afraid I didn’t quite understand that Could you say it one more time, please?', {
  'I’m afraid I didn’t quite understand that Could you say it one more time, please?': [0 * 1000,  5 * 1000],
});
var en29 = addAudioSentances('I missed that. Could you say it again, please', 'I missed that. Could you say it again, please?', {
  'I missed that. Could you say it again, please?': [0 * 1000,  3 * 1000],
});
// var en30 = addAudioSentances('Can you repeat what you just said', 'Can you repeat what you just said?', {
//   'Can you repeat what you just said?': [0 * 1000,  3 * 1000],
// });
var en31 = addAudioSentances('I’m sorry, would you mind repeating that again', 'I’m sorry, would you mind repeating that again?', {
  'I’m sorry, would you mind repeating that again?': [0 * 1000,  3 * 1000],
});
var en32 = addAudioSentances('Could you go into a little more detail', 'Could you go into a little more detail?', {
  'Could you go into a little more detail?': [0 * 1000,  3 * 1000],
});
var en33 = addAudioSentances('Could you please tell me what you mean by', 'Could you please tell me what you mean by', {
  'Could you please tell me what you mean by': [0 * 1000,  3 * 1000],
});
var en34 = addAudioSentances('Let me check if I understood you correctly, Did you say that', 'Let me check if I understood you correctly, Did you say that', {
  'Let me check if I understood you correctly, Did you say that': [0 * 1000,  3 * 1000],
});
var en35 = addAudioSentances('Could you be a little bit more precise, please', 'Could you be a little bit more precise, please?', {
  'Could you be a little bit more precise, please?': [0 * 1000,  3 * 1000],
});
var en36 = addAudioSentances('Can you expand on that', 'Can you expand on that?', {
  'Can you expand on that?': [0 * 1000,  3 * 1000],
});




var en1 = addAudioSentances('en1', 'en1', {
  'Thank you all for coming.': [0 * 1000, 1.52  * 1000],
  'I appreciate everyone being here.': [1.55 * 1000, 2.33  * 1000],
  'First, I’d like to welcome you all.': [3.9 * 1000, 2.3  * 1000],
  'I would like to thank you for being here on time.': [6.3 * 1000, 2.7  * 1000],
  'I wish to thank you all for coming on such short notice.': [9.1 * 1000, 2.9  * 1000],
});

var en2 = addAudioSentances('en2', 'en2', {
  'Our aim today is to.': [0 * 1000, 1.6  * 1000],
  'We are here today to decide on/agree on, etc.': [1.65 * 1000, 2.82  * 1000],
  'By the end of today’s meeting, we need to. ': [5.15 * 1000, 2.24  * 1000],
  'I’ve scheduled this meeting so that we.': [7.6 * 1000, 2.13  * 1000],
  'The purpose of today’s meeting is.': [9.9 * 1000, 2.15  * 1000],
  'Today, we are going to.': [12.14 * 1000, 2  * 1000],
  'First, we will be discussing.': [14.3 * 1000, 2  * 1000],
  'After that, we will move on to.': [16.4 * 1000, 2.33  * 1000],
  'Then, we’ll try to cover.': [18.76 * 1000, 1.85  * 1000],
  'Shortly after, we’ll go over.': [20.8 * 1000, 2.24  * 1000],
  'Next, we will consider.': [23.14 * 1000, 1.78  * 1000],
  'If there’s enough time, we will also go through.': [25 * 1000, 2.87  * 1000],
  'Finally, we will talk about.': [27.92 * 1000, 1.97  * 1000],
});
var en3 = addAudioSentances('en3', 'en3', {
  'I would like to inform everyone about the project’s progress.': [0 * 1000, 3.3  * 1000],
  'How is the project coming along?.': [3.2 * 1000, 2.23  * 1000],
  'Has everyone submitted their monthly reports?.': [5.6 * 1000, 2.77  * 1000],
  'Josh, can you let us know what’s new in?.': [8.34 * 1000, 2.6  * 1000],
  'Regarding last month’s reports, I would like to add.': [11 * 1000, 3.3  * 1000],
  'I suggest we start with Mike updating us on.': [14.3 * 1000, 3  * 1000],
  'If nobody has anything else to share, let’s move on to.': [17.3 * 1000, 3.47  * 1000],
  'I think that covers it. Now we can go to our next topic.': [20.88 * 1000, 3.7  * 1000],
  'Let’s move on to our next point.': [ 24.64 * 1000, 2.2  * 1000],
  'Since we’ve covered this issue, now we can go to the next one.': [26.85 * 1000, 3.6  * 1000],
  'The next topic we need to cover is.': [30.62 * 1000, 2.3  * 1000],
  'Now that we’ve found a solution/finished discussing this topic, we can go to.': [33 * 1000, 4.5  * 1000],
});
var en4 = addAudioSentances('en4', 'en4', {
  'Can we continue this discussion later and go back to?.': [0 * 1000, 3  * 1000],
  'We are getting out of topic. Can we return to?.': [3 * 1000, 3.56  * 1000],
  'Can we go back to our subject, please?': [6.65 * 1000, 2.42  * 1000],
  'I’m afraid we are running out of time, so could we go back to?.': [9.25 * 1000, 3.44  * 1000],
  'Getting back to the topic.': [12.8 * 1000, 1.7  * 1000],
  'Let’s skip this topic and take it up at another time.': [14.6 * 1000, 3  * 1000],
  'We can continue talking about this later. Now, let’s go back to our previous subject.': [17.8 * 1000, 5.1  * 1000],
});
var en5 = addAudioSentances('en5', 'en5', {
  'Now, Carl will tell us more about.': [0 * 1000, 2.25  * 1000],
  'I would like to hand it over to Mike, who can share more on this topic.': [2.4 * 1000, 3.6  * 1000],
  'Kim is now going to take over.': [6.12 * 1000, 2.11  * 1000],
  'I’d like to hand you over to Joshua who will talk you through.': [8.34 * 1000, 3.2  * 1000],
  'Now I would like to introduce Sim who is going to talk about.': [11.65 * 1000, 3  * 1000],
});

var s1 = addAudioSentances('thanks', 's1', {
  'Thanks very much': [1.94 * 1000, 3.46 * 1000],
  'Thanks so much': [7 * 1000, 3.3 * 1000],
  'Thanks a million for all your help': [12.3 * 1000, 5.16 * 1000],
  'Please let me know if i can return the favor': [20.2 * 1000, 6.6 * 1000],
  'I owe you one': [36.96 * 1000, 3 * 1000],
  'I really appreciate it': [49.46 * 1000, 4 * 1000],
  'Thanks so much, you\'re a star': [55 * 1000, 5.85 * 1000],
  'What would i do without you': [70.42 * 1000, 4.32 * 1000],
  'That\'s so nice of you or That\'s very thoughtful of you thanks': [90 * 1000, 6.2 * 1000],

  'Formal - We are very grateful for the support you\'ve provided': [109.91 * 1000, 3.7 * 1000],
  'Formal - Your support is greatly appreciated': [115.2 * 1000, 5.9 * 1000],
  'Formal - I sincerely appreciate your assistance/advice/recommendation': [130 * 1000, 6.5 * 1000],
  'Formal - I would like to express my personal gratitude for the support you provided': [155 * 1000, 5.75 * 1000],
  'Formal - You\'ve been extremely helpful and the support you provide is highly appreciated': [162.5 * 1000, 11.5 * 1000],

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
  var selectedSprites = JSON.parse(localStorage.getItem('sprites_en')) || {};
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
  playSprits(spritesArray, 0, 1000, 2);
}


