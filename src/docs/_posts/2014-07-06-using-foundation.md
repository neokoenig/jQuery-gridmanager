---
layout: page
title: "Using Foundation"
category: tut
date: 2014-07-06 10:47:20
---

Whilst gridmanager.js is primarily intended for use in Bootstrap 3.x, it has been deliberately put together so that you can integrate any CSS framework which has a similar grid concept.

The only real pre-requisites are the concept of a 'row' which has it's own class, and a column class (such as col-md-6, span6, large6 etc) which has a numerical reference at the end. As such, you can actually make gridmanager work in Bootstrap 2.x & Foundation 5.x by just changing the various classes in the options to suit your needs.

Since version 0.2.3 we went for fontawesome as a default meaning it's a lot easier to use another framework, as you don't have to constantly worry about icons.

Please see the source code of the [demo foundation version](/jQuery-gridmanager/demo/foundation.html) for the recommended options to set.
