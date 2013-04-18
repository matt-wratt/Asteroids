var SoundManager = (function() {

  function SoundManager() {
    try {
      this._context = new webkitAudioContext();
    } catch (e) {
      alert('Web Audio API is not supported in this browser');
    }

    this._mainNode = this._context.createGainNode(0);
    this._mainNode.connect(this._context.destination);
  }

  SoundManager.prototype = {
    clips: {},
    enabled: true,
    _context: null,
    _mainNode: null,

    loadAsync: function (path, callbackFcn) {
      if(!callbackFcn) callbackFcn = function() { };

      if (this.clips[path]) {
        callbackFcn(this.clips[path].s);
        return this.clips[path].s;
      }

      var clip = {
        s: new Sound(path),
        b: null,
        l: false
      };
      this.clips[path] = clip;
      clip.s.path = path;

      var self = this;
      var request = new XMLHttpRequest();
      request.open('GET', path, true);
      request.responseType = 'arraybuffer';
      request.onload = function () {
        self._context.decodeAudioData(request.response, function (buffer) {
          self.clips[path].b = buffer;
          self.clips[path].l = true;
          callbackFcn(self.clips[path].s);
        }, function (data) {
          console.log('failed to load sound');
        });
      };
      request.send();

      return clip.s;

    },

    togglemute: function() {
      if(this._mainNode.gain.value>0) {
        this._mainNode.gain.value = 0;
      }
      else {
        this._mainNode.gain.value = 1;
      }
    },

    stopAll: function()
    {
      this._mainNode.disconnect();
      this._mainNode = this._context.createGainNode(0);
      this._mainNode.connect(this._context.destination);
    },

    playSound: function (path, settings) {
      if (!this.enabled) return false;

      var looping = false;
      var volume = 0.2;

      if (settings) {
        if (settings.looping) looping = settings.looping;
        if (settings.volume) volume = settings.volume;
      }

      var sd = this.clips[path];
      if (sd === null) return false;
      if (sd.l === false) return false;

      var currentClip = null;

      currentClip = this._context.createBufferSource();

      sd.s.clip = currentClip;

      currentClip.buffer = sd.b;
      currentClip.gain.value = volume;
      currentClip.loop = looping;

      currentClip.connect(this._mainNode);
      currentClip.noteOn(0);

      return true;
    }
  };

  return new SoundManager();

}());

var Sound = (function() {

  function Sound() {
    this.volume = 1;
    this.looping = false;
  }

  Sound.prototype = {
    play: function(settings) {
      this.stop();
      var volume = this.volume;
      var loop = this.looping;
      if(settings) {
        if(settings.volume) volume = settings.volume;
        if(settings.loop) loop = settings.loop;
      }
      SoundManager.playSound(this.path,{looping: loop, volume: volume});
    },
    stop: function() {
      if(this.clip) {
        this.clip.noteOff(0);
        delete this.clip;
      }
    },
    playing: function() {
      return !!this.clip;
    }
  };

  return Sound;

}());
