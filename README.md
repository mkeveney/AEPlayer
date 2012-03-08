AEPlayer
========

AEPlayer is a small standalone JavaScript library implementing CSS-sprite style bitmap
animation, along with a familiar control panel similar to that of a streaming video
player.  With it, the user may control the speed, pause, restart, and examine frames of
the animation individually.

The compressed version of the library is just a bit over 7K, and creates no global
variables.

It was developed for use on [AnimatedEngines](http://www.animatedengines.com), as a
convenient way to update my earlier animated GIF images, while still leveraging existing
artwork.

# Usage

Add the following files to your web server:

    aeplayer.js or aeplayer-min.js
    aeplayer.css or aeplayer-min.css
    aeplayer_panel.png

Prepare an image file containing the frames of your animation arranged vertically.  See
`aeplayer-sample.png` for an example. Any image format that can be set as a CSS background
may be used: JPEG, GIF, or PNG.

Add these to the `head` element:

    <link href="aeplayer.css" media="screen" rel="stylesheet" type="text/css" />
    <script src="aeplayer.js" type="text/javascript"></script>

In the body, add a `div` like so:

    <div class="aeplayer aepframes_12" style="width: 485px; height: 239px; background: url(aeplayer-sample.png)"></div>

* The div must have the aeplayer and aepframes_NN classes, where NN is the number of
  frames in the image.
* The style must specify the pixel width and height of a single frame
* The background image must specify the image file containing the frames.

You may have multiple aeplayer divs on a single page.

See sample.html for an example.

When your page loads, AEPlayer will insert the necessary tags to render the control panel
and will start the animation.

# Advanced options

## Restyle the control panel

The control panel also uses the CSS-sprite technique for displaying it's background and
various button states, etc.  You may replace aeplayer_panel.png with an image of your own.
If you change any dimensions, you'll have to make corresponding changes to aeplayer.css.

`Aeplayer_panel.png` was created using _Inkscape_, then manually exported to a PNG file.
The source SVG file `aeplayer-panel-source.svg` is include, if you'd just like to make a
small change or add branding to your control panel.  You can get Inkscape at
http://inkscape.org/

## Split large animations into multiple files.

A problem was encountered with certain versions of Internet Explorer when using
particularly large animation files.  It seems that files larger than a certain size were
not acceptable as background images.

This was written some time ago, and the IE version and image size threshold have
unfortunately been lost.

To work around this, you may add extension images as children of the initial
`div` like so:

    <div class="aeplayer aepframes_60" style="width: NNNpx; height: NNNpx; background: url(my-image-0.gif);">
      <div class="aeplayer_ext aepinitframe_30" style="background: url(my-image-1.gif); visibility: hidden;"></div>
    </div>

The aepinitframe_NN class tells aeplayer that frame NN corresponds to the first frame in
the extension.  AEPlayer will then switch the background image as well as the background
offsets when rendering a frame.

This feature has not been extensively tested, and does tend to slow down the animation
somewhat on some browsers.  It is not recommended for use unless you encounter this
particular browser issue.

# Caveats / To-do items

* The control panel logic should be separated from the animator itself. Plans are underway
  to support a new canvas-based vector animation technique.

* The code was written before some modern JavaScript and HTML practices came into vogue,
  and should probably be brought up-to-date here and there.  I.e. the `aepframes_xx` style
  to specify the frame count should probably use an HTML 5 `data-` attribute instead.

* There is no provision for internationalizing the 'speed' and 'frame' labels.

* Animations are only activated in the `load` event.  There is no provision for adding new
  panels dynamically.

# Special Thanks

To Robert Nyman, for releasing his _getElementsByClassName_ function:

	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/

To all involved with the _Inkscape_ project:

    http://www.inkscape.org

# License (MIT)

This license applies only to this animation library, and not to any images or content of
AnimatedEngines.com.

Copyright (c) 2012 Matt Keveney

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

