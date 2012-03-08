/*!
 * AEPlayer animation library
 #
 * http://github.com/mkeveney/aeplayer
 *
 * Copyright 2012, Matt Keveney
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Includes getElementsByClassName function, Developed by Robert Nyman, http://www.robertnyman.com,
 * Code/licensing: http://code.google.com/p/getelementsbyclassname/
 *
 * March 08 2012 12:01 am PST
 */
(function () {
    var cross, makeSlider, makeButtonRepeater, makePlayerByEl, makePlayer, makePanel;

    // cross-browser compatibility utilities
    //
    cross = {

        // install event handler using method appropriate to element/browser version.
        //
        addListener: function (element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, handler);
            }
        },

        // remove event handler.
        //
        removeListener: function (element, type, handler) {
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent('on' + type, handler);
            }
        },


        // find first child element using specified class name.
        //      ..this doesn't decend the whole tree.
        //
        getFirstChildWithClass: function (element, classname) {

            var cnRegex, foundEl, i;

            // optimize for FireFox?
            //
            // if (element.getElementsByClassName) {
            //     return element.getElementsByClassName(classname)[0];
            // }
            //

            cnRegex = new RegExp("(^|\\s)" + classname + "(\\s|$)");
            for (i = 0; i < element.childNodes.length; i++) {
                foundEl = element.childNodes[i];

                if (cnRegex.test(foundEl.className)) {
                    return foundEl;
                }
            }
            // return undefined.
        },
        /*
            Developed by Robert Nyman, http://www.robertnyman.com
            Code/licensing: http://code.google.com/p/getelementsbyclassname/
        */
        getElementsByClassName: function (className, tag, elm) {
            if (document.getElementsByClassName) {
                this.getElementsByClassName = function (className, tag, elm) {
                    elm = elm || document;
                    var elements = elm.getElementsByClassName(className),
                        nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
                        returnElements = [],
                        current,
                        i,
                        il;
                    for (i = 0, il = elements.length; i < il; i += 1) {
                        current = elements[i];
                        if (!nodeName || nodeName.test(current.nodeName)) {
                            returnElements.push(current);
                        }
                    }
                    return returnElements;
                };
            } else if (document.evaluate) {
                this.getElementsByClassName = function (className, tag, elm) {
                    tag = tag || "*";
                    elm = elm || document;
                    var classes = className.split(" "),
                        classesToCheck = "",
                        xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                        namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null,
                        returnElements = [],
                        elements,
                        node,
                        j,
                        jl;
                    for (j = 0, jl = classes.length; j < jl; j += 1) {
                        classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
                    }
                    try {
                        elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
                    } catch (e) {
                        elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
                    }
                    while (!!(node = elements.iterateNext())) {
                        returnElements.push(node);
                    }
                    return returnElements;
                };
            } else {
                this.getElementsByClassName = function (className, tag, elm) {
                    tag = tag || "*";
                    elm = elm || document;
                    var classes = className.split(" "),
                        classesToCheck = [],
                        elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag),
                        current,
                        returnElements = [],
                        match,
                        k,
                        kl,
                        l,
                        ll,
                        m,
                        ml;
                    for (k = 0, kl = classes.length; k < kl; k += 1) {
                        classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
                    }
                    for (l = 0, ll = elements.length; l < ll; l += 1) {
                        current = elements[l];
                        match = false;
                        for (m = 0, ml = classesToCheck.length; m < ml; m += 1) {
                            match = classesToCheck[m].test(current.className);
                            if (!match) {
                                break;
                            }
                        }
                        if (match) {
                            returnElements.push(current);
                        }
                    }
                    return returnElements;
                };
            }
            return this.getElementsByClassName(className, tag, elm);
        }
    };
    //
    // Create a slider control.
    //
    //  Parameters:
    //
    //      track - HTML div element of slider track,
    //              expected to have a child div we use for the knob
    //
    //  The slider object supports the following methods:
    //
    //      setMin(n)       - set minimum value; default 0
    //      setMax(n)       - set maximum value; default 100
    //      setValue(n)     - set current value; initially 0
    //      getValue()      - returns current value.
    //      setListener(f)  - set function to be called when value changes;
    //                          default 'undefined'
    //
    //      The listener function will be called with a number parameter
    //      equal to the current value.
    //
    //      All 'setxx()' methods return the slider object to enable chained
    //      expressions.
    //
    //  Currently supports fixed-size horizontal sliders only.
    //
    //  The slider's value is always an integer.  When the slider is released,
    //  it snaps to the nearest position that represents value in range.  If the range is
    //  larger than number of pixels the slider occupies, some values will be skipped.
    //
    makeSlider = function (track) {

        // private variables
        // -----------------
        //
        var knob,               // element of knob
            min,                // our range and value
            max,
            value,
            onchange,           // our listener
            trackLeft,          // client position of left edge of track
            trackWidth,         // width of track in pixels, minus knob width
            dragStart,
            findPos,
            enRange,
            setKnobToValue,
            handleMouseMove,
            handleMouseUp,
            handleMouseDown;

        // private functions
        // -----------------

        // find absolute x,y position of an element
        //
        //      (we only use x, so we could simplify this)
        //
        findPos = function (obj) {
            var curleft, curtop;
            curleft = curtop = 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                curtop = obj.offsetTop;
                while (!!(obj = obj.offsetParent)) {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }
            }
            return [curleft, curtop];
        };

        // compute legal value (integer) nearest to the specified number
        //
        enRange = function (v) {
            if (v < min) {
                return min;
            }
            if (v > max) {
                return max;
            }

            v = Math.floor(v + 0.5);        // constrain to integers... might make this optional someday

            return v;
        };


        // move knob to position represented by current value
        //
        setKnobToValue = function () {

            // snap knob to exact pixel representing our actual value
            //
            var x = ((value - min) * trackWidth / (max - min));
            knob.style.left = x + "px";
        };

        // handle mouse moves when dragging the knob
        //
        handleMouseMove = function (e) {

            e = e || window.event;                      // compatibility hack
            if (e.preventDefault) {
                e.preventDefault();                     // prevent drag operation from selecting text
            }

            // Make the knob track the 'natural' position while dragging.
            // We'll snap the knob to the actual value on mouseup.
            //
            var x = e.clientX - dragStart.x;            // get relative mouse move from start
            x += dragStart.k;                           // and add to knob starting position

            x = (x < 0) ? 0 : x;                        // constrain to track range
            x = (x > trackWidth) ? trackWidth : x;

            knob.style.left = x + "px";

            // now see if we have a new value.
            //
            x = min + (x * (max - min) / trackWidth);   // scale to value range and constrain to integer
            x = Math.floor(x + 0.5);

            if (x !== value) {                          // if it's a new value, notify our listener
                value = x;
                if (onchange) {
                    onchange(x);
                }
            }
            return false;
        };

        // mouse up handler detaches itself and the move handler, and updates the value
        //
        handleMouseUp = function () {
            cross.removeListener(document, "mouseup", handleMouseUp);
            cross.removeListener(document, "mousemove", handleMouseMove);

            // snap the slider to the actual value
            //
            setKnobToValue();

            return false;
        };

        // mousedown handler for knob
        //
        handleMouseDown = function (e) {
            e = e || window.event;                  // compatibility hack - put in cross namespace?

            if (e.preventDefault) {
                e.preventDefault();                 // prevent drag operation from selecting text
            }

            var kstart = parseInt(knob.style.left, 10);

            dragStart = {x: e.clientX, k: kstart};  // remember dragstart and knobstart

            cross.addListener(document, "mouseup", handleMouseUp);
            cross.addListener(document, "mousemove", handleMouseMove);

            // prevent text selection in IE ?
            return false;
        };

        // initialization
        // --------------

        knob = cross.getFirstChildWithClass(track, "knob");

        min = 0;
        max = 100;
        value = 0;

        // compute track start and width
        //
        trackLeft  = findPos(track)[0];
        trackWidth = track.clientWidth - knob.clientWidth;

        // init knob to proper position.
        //
        knob.style.position = "relative";
        setKnobToValue();

        cross.addListener(knob, "mousedown", handleMouseDown);

        // return public api
        // ----------------
        //
        return {

            setValue: function (newValue) {
                value = enRange(newValue);
                setKnobToValue();
                return this;
            },
            getValue: function () {
                return value;
            },
            setMin: function (newMin) {
                min = newMin;
                return this;
            },
            setMax: function (newMax) {
                max = newMax;
                return this;
            },

            //  todo: should we refactor this to comply with 'add/removeEventListener' pattern?
            //
            setListener: function (newOnChange) {
                onchange = newOnChange;
                return this;
            }
        };
    };


    // Create a button repeater.
    //
    //  Parameters:
    //
    //      elButton        - button element to assign
    //      clickHandler    - method to call when the button is clicked or repeats
    //
    //  The repeater object supports the following methods:
    //
    //      setInitDelay(n)     - sets initial delay before repeating in milliseconds; default 750
    //      setRepeatDelay(n)   - sets delay between repeats; default 75
    //
    //      Each of these methods returns the repeater object to enable chained expressions.
    //
    makeButtonRepeater = function (elButton, clickHandler) {

        var repeating,
            intervalId,
            initDelay,
            repeatDelay,
            intervalfn,
            handleMouseDown,
            handleMouseUpOrOut,
            handleKeyDown;

        // We use the same interval function for two purposes... (should we?)
        //
        intervalfn = function () {

            if (repeating) {
                clickHandler();
            } else {
                repeating = true;
                window.clearInterval(intervalId);
                intervalId = window.setInterval(intervalfn, repeatDelay);
            }
        };

        // handler for mousedown event
        //
        handleMouseDown = function () {

            repeating = false;

            clickHandler();

            intervalId = window.setInterval(intervalfn, initDelay);
        };

        // on mouse up or mouse out, clear timer.
        //
        handleMouseUpOrOut = function () {
            window.clearInterval(intervalId);
        };

        // on spacebar fire the click handler
        //
        //  The keydown function already auto-repeats, so we need not add any extra logic
        //
        handleKeyDown = function (e) {
            e = e || window.event;                      // compatibility hack
            if (e.keyCode === 32) {
                clickHandler();
            }
        };

        // defaults
        //
        initDelay = 750;
        repeatDelay = 75;


        // attach events
        //
        cross.addListener(elButton, "mousedown", handleMouseDown);
        cross.addListener(elButton, "mouseup",   handleMouseUpOrOut);
        cross.addListener(elButton, "mouseout",  handleMouseUpOrOut);
        cross.addListener(elButton, "keydown",   handleKeyDown);

        // return interface for adjusting parameters
        //
        return {
            setInitDelay: function (n) {
                initDelay = n;
                return this;
            },

            setRepeatDelay: function (n) {
                repeatDelay = n;
                return this;
            }
        };
    };

    //
    // Create an image player.
    //
    //  Parameters:
    //
    //      id          - the id of the 'div' to show the animation in.
    //
    //                    This div's style.background-image must be set to
    //                    a 'framelist' image as described in the documentation.
    //
    //                    The style.height and style.width must be set in pixels
    //                    to the exact frame size of the image.
    //
    //  The player object supports the following methods:
    //
    //      play()              - starts the player; defaults to paused state
    //      pause()             - pauses the player
    //      isPaused()          - returns current pause state
    //      setFrame(n)         - set current frame (zero-based integer); default 0
    //      getFrame()          - returns current frame;
    //      setRate(n)          - sets current rate in frames-per-second; default 10
    //      getRate()           - returns current rate
    //      setFrameCount(n)    - sets frame count for 'framelist' image; default 16 or as specified in 'aepframes_nnn' class on div
    //      getFrameCount()     - returns current frame count.
    //      getPlayerDiv()      - returns the player's 'div' element.
    //
    //      The play(), pause() and all setXxx() methods return the player object,
    //      to enable chained expressions.
    //
    makePlayerByEl = function (elPlayerDiv) {

        var running,
            rate,
            frame,
            frameCount,
            frameRegexMatch,
            intervalId,
            frameHeight,
            activateFrame,
            intervalfn,
            imagelist,
            extDivs,
            i,
            lastImgIdx;

        // private helper method, normalizes frame ix and sets backgroundposition to match
        //
        activateFrame = function () {

            var i, imgix, imgframe;

            // normalize frame to range 0 - (frameCount-1)
            frame = (frame + frameCount) % frameCount;

            // find proper background image in our imagelist
            //      (imagelist must be sorted by increasing iframe)
            //
            imgix = 0;
            for (i = 0; i < imagelist.length; i++) {
                if (frame >= imagelist[i].iframe) {
                    imgix = i;
                }
            }

            // compute relative frame within the selected image
            //
            imgframe = frame - imagelist[imgix].iframe;

            if (lastImgIdx != imgix) {
              elPlayerDiv.style.backgroundImage = imagelist[imgix].img;
              lastImgIdx = imgix;
            }
            elPlayerDiv.style.backgroundPosition = "0px -" + imgframe * frameHeight + "px";
        };

        // pass this function to setinterval
        //
        intervalfn = function () {
            frame += 1;
            activateFrame();
        };

        // initialize
        // ----------

        //elPlayerDiv = document.getElementById(id);
        //if (!elPlayerDiv) {
        //    return null;
        //}

        running = false;        // could we use intervalId for this?
        intervalId = 0;

        rate = 10;
        frame = 0;
        frameCount = 16;
        lastImgIdx = -1;

        imagelist = [];

        // get framecount if specified in class.
        //
        frameRegexMatch = /\baepframes_(\d+)\b/.exec(elPlayerDiv.className);
        if (frameRegexMatch) {
            frameCount = parseInt(frameRegexMatch[1], 10);
        }

        // the div's background image is always used for frame zero
        //
        imagelist.push({iframe: 0, img: elPlayerDiv.style.backgroundImage});

        // look for any 'extensions' within the div and push into our imagelist
        //
        extDivs = cross.getElementsByClassName("aeplayer_ext", "div", elPlayerDiv);

        for (i = 0; i < extDivs.length; i++) {
            frameRegexMatch = /\aepinitframe_(\d+)\b/.exec(extDivs[i].className);
            if (frameRegexMatch) {
                imagelist.push({iframe: parseInt(frameRegexMatch[1], 10), img: extDivs[i].style.backgroundImage});
            }
        }


        frameHeight = elPlayerDiv.clientHeight;

        // return our public API
        // ---------------------
        //
        return {

            play: function () {
                if (!running) {
                    if (intervalId) {
                        window.clearInterval(intervalId);
                    }
                    intervalId = window.setInterval(intervalfn, 1000 / rate);
                    running = true;
                }
                return this;
            },

            pause: function () {
                if (running) {
                    window.clearInterval(intervalId);
                    intervalId = 0;
                    running = false;
                }
                return this;
            },

            isPaused: function () {
                return !running;
            },

            setFrame: function (newFrame) {
                if (!running) {
                    frame = newFrame;
                    activateFrame();            // this will put in range.
                }
                return this;
            },

            getFrame: function () {
                return frame;
            },

            setRate: function (newRate) {

                rate = newRate;

                if (running) {
                    this.pause();
                    this.play();
                }
                return this;
            },

            getRate: function () {
                return rate;
            },

            setFrameCount: function (n) {
                frameCount = n;
                return this;
            },

            getFrameCount: function () {
                return frameCount;
            },

            getPlayerDiv: function () {
                return elPlayerDiv;
            }
        };
    };


    // convenience wrapper, allows ID instead
    //
    makePlayer = function (id) {
        var elPlayerDiv = document.getElementById(id);
        if (!elPlayerDiv) {
            return null;
        }
        return makePlayerByEl(elPlayerDiv);
    };



    //
    // Create a player control panel.
    //
    //  Parameters:
    //
    //      player - the player object to be controlled
    //
    //      id - document id of the panel div element.
    //
    //          If id is empty or omitted, the following html code is
    //          automatically injected into the document immediately following the
    //          player element.
    //
    //          <div class="aep_panel">
    //              <button class="playpause"/>
    //              <button class="prev"/>
    //              <div class="slider"><div class="knob"></div></div>
    //              <button class="next"/>
    //              <span class="slabel">Speed: xx fps</span>
    //          </div>
    //
    //          If present, the panel div element element is searched for children
    //          as shown above. If any of these child elements is missing, the
    //          corresponding feature will be disabled.
    //
    //          The children may be in any order.  They are identified by class, not
    //          by ID.  If multiple children exist with the same class, the first one
    //          found is used. The 'knob' element must be a child of the slider element.
    //
    //          The playPause button toggles the player between paused and running
    //          states.  The slider and prev/next buttons adjust frame _rate_ when
    //          running, and adjust frame _number_ when paused.
    //
    //          During operation, these elements are modified as follows:
    //
    //          * The playpause button is alternated between these styles:
    //
    //              'playpause play'        - CSS should display a 'play'  style button
    //              'playpause pause'       - CSS should display a 'pause' style button
    //
    //          * The knob horizontal position is altered between the ends of the slider.
    //
    //          * The slabel contents are altered to either of these forms:
    //
    //                  'Speed: xx fps'     - where xx is the animation rate in frames per second
    //                  'Frame: xx'         - where xx is the 0-based frame index
    //
    //
    //  The panel object supports the following methods:
    //
    //      setMinRate(n)       - sets the minimum allowed rate; default 1
    //      setMaxRate(n)       - sets the maximum allowed rate; default 25
    //      setRateInc(n)       - sets the increment for the prev/next buttons; default 1
    //      setButtonText(s)    - sets text for play/pause button.
    //                            Alternates must be seperated by a semicolon with the play option first,
    //                            Example: "Play;Pause"  default: ""
    //      setLabelText(s)     - sets text template for label.  Alternates must be separated by a
    //                            semicolon with the 'playing' option first.  A %d may appear to
    //                            insert the frame rate while playing or the frame number while paused.
    //                            default: "Speed %d fps;Frame %d";
    //
    //      Each of these methods returns the panel object to enable chained expressions.
    //
    makePanel = function (player, id) {

        // private variables
        //
        var elPanel,
            elPlay,
            elPrev,
            elNext,
            elSLabel,
            elSlider,
            slider,
            minRate,
            maxRate,
            rateInc,
            updateUIState,
            sliderChange,
            playButtonClick,
            nextPrev,
            nextButtonClick,
            prevButtonClick,
            playButtonText,
            pauseButtonText,
            speedLabelText,
            frameLabelText,
            updateLabel,
            updatePlayButton;

        // set label text appropriately
        //
        updateLabel = function () {
            if (elSLabel) {
                if (player.isPaused()) {
                    elSLabel.innerHTML = frameLabelText.replace("%d", player.getFrame());
                } else {
                    elSLabel.innerHTML = speedLabelText.replace("%d", player.getRate());
                }
            }
        };




        // set play button class and text appropriately
        //
        updatePlayButton = function () {
            if (elPlay) {
                if (player.isPaused()) {
                    elPlay.className = "playpause play";
                    elPlay.innerHTML = playButtonText;
                } else {
                    elPlay.className = "playpause pause";
                    elPlay.innerHTML = pauseButtonText;
                }
            }
        };


        // set label and playbutton image to match current state
        //
        updateUIState = function () {
            updateLabel();
            updatePlayButton();
        };


        // handle slider messages
        //
        sliderChange = function (sliderv) {

            if (player.isPaused()) {
                player.setFrame(sliderv);
            } else {
                player.setRate(sliderv);
            }
            updateUIState();
        };


        // handle 'play' button.
        //
        playButtonClick = function () {

            if (player.isPaused()) {

                // set slider to rate range and most recent rate
                //
                if (slider) {
                    slider.setMin(minRate).setMax(maxRate).setValue(player.getRate());
                }

                player.play();
            } else {

                player.pause();

                // set slider to nFrames range and current frame.
                //
                if (slider) {
                    slider.setMin(0).setMax(player.getFrameCount() - 1).setValue(player.getFrame());
                }

            }
            updateUIState();
        };


        // Process next/prev buttons
        //
        nextPrev = function (adj) {

            if (player.isPaused()) {
                player.setFrame(player.getFrame() + adj);
                if (slider) {
                    slider.setValue(player.getFrame());
                }

            } else {
                var r = player.getRate() + adj * rateInc;
                if (r < minRate) {
                    r = minRate;
                }
                if (r > maxRate) {
                    r = maxRate;
                }
                player.setRate(r);
                if (slider) {
                    slider.setValue(r);
                }
            }
            updateUIState();
        };
        nextButtonClick = function () {
            nextPrev(1);
        };
        prevButtonClick = function () {
            nextPrev(-1);
        };


        // initialize
        // ----------

        minRate = 1;
        maxRate = 25;
        rateInc = 1;
        playButtonText = "";
        pauseButtonText = "";
        speedLabelText = "Speed %d fps";
        frameLabelText = "Frame %d";

        if (!player) {
            return null;
        }

        if (id) {

            // locate user-specified panel.
            //
            elPanel = document.getElementById(id);
            if (!elPanel) {
                return null;
            }

        } else {

            // inject panel immediately after player element.
            //
            elPanel = document.createElement("div");
            elPanel.className = "aep_panel";
            elPanel.innerHTML =
                "<button class='playpause pause'></button>" +
                "<button class='prev'></button>" +
                "<div class='slider'><div class='knob'></div></div>" +
                "<button class='next'></button>" +
                "<span class='slabel'>Speed: xx fps</span>";

            if (player.getPlayerDiv().nextSibling) {
                player.getPlayerDiv().parentNode.insertBefore(elPanel, player.getPlayerDiv().nextSibling);
            } else {
                player.getPlayerDiv().parentNode.appendChild(elPanel);
            }
        }

        // locate control elements
        //
        // It's ok if any are undefined... but kindof silly in some combinations
        //
        //  todo: make sure everything works if any are undefined.
        //
        elPlay = cross.getFirstChildWithClass(elPanel, "playpause");
        elPrev = cross.getFirstChildWithClass(elPanel, "prev");
        elNext = cross.getFirstChildWithClass(elPanel, "next");
        elSlider = cross.getFirstChildWithClass(elPanel, "slider");
        elSLabel = cross.getFirstChildWithClass(elPanel, "slabel");

        // attach to our methods
        //
        if (elPlay) {
            cross.addListener(elPlay, "click", playButtonClick);
        }
        if (elPrev) {
            makeButtonRepeater(elPrev, prevButtonClick);
        }
        if (elNext) {
            makeButtonRepeater(elNext, nextButtonClick);
        }
        if (elSlider) {
            slider = makeSlider(elSlider).setListener(sliderChange);

            if (player.isPaused()) {
                slider.setMin(0).setMax(player.getFrameCount() - 1).setValue(player.getFrame());
            } else {
                slider.setMin(minRate).setMax(maxRate).setValue(player.getRate());
            }
        }
        updateUIState();


        // return our public API
        // ---------------------
        //
        return {

            setMinRate: function (n) {
                minRate = n;
                if (slider) {
                    slider.setMin(n);
                }
                return this;
            },
            setMaxRate: function (n) {
                maxRate = n;
                if (slider) {
                    slider.setMax(n);
                }
                return this;
            },
            setRateInc: function (n) {
                rateInc = n;
                return this;
            },
            setButtonText: function (t) {
                var ay = t.split(";");
                playButtonText = ay[0];
                pauseButtonText = ay[1];
                updatePlayButton();
                return this;
            },
            setLabelText: function (t) {
                var ay = t.split(";");
                speedLabelText = ay[0];
                frameLabelText = ay[1];
                updateLabel();
                return this;
            }
        };
    };


    // on load, make a player and panel for each div in the body of the page having class 'aeplayer.'
    //
    cross.addListener(window, 'load', function () {
        var playerEls, i;

        playerEls = cross.getElementsByClassName("aeplayer", "div");

        for (i = 0; i < playerEls.length; i++) {
            makePanel(makePlayerByEl(playerEls[i]).play());
        }
    });

}());
