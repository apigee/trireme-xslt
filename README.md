# trireme-xslt

This module presents an abstraction of XLST processing. It is specifically
designed for the Trireme platform to allow efficient processing of
XSLT when Node.js applications are run on Java.

Trireme is an implementation of Node.js on top of the Java virtual machine.
It makes it possible to embed Node.js into applications where it would be
more difficult to go currently, and gives direct access to native Java
technologies from Node.js. 

One technology that is particularly mature on Java is XML processing, and
this module provides that access.

One advantage of this module is that it can use features of the Java
language that allow the processing to take place in a thread pool, making
it possible to take advantage of extra CPU cores for XSLT processing --
which can be CPU-intensive and is highly parallelizable. This
happens automatically in Trireme when a callback is passed to the
"transform" function.

In order to make it possible to test apps outside Trireme, this module
will detect if it is running in Trireme and if not it will use the
"node_xslt" module instead.

For more on Trireme, check it out on GitHub:

[https://github.com/apigee/trireme](https://github.com/apigee/trireme)

## Example

    var fs = require('fs');
    var xslt = require('trireme-xslt');
    
    var stylesheetText = fs.readFileSync('../fixtures/samplestylesheet.xsl');
    var cs = xslt.compileStylesheet(stylesheetText);
    
    var input = '<Hello>This is some XML!</Hello>';
    
    // Synchronous transformation
    var result = xslt.transform(cs, input);
    
    // Async transformation
    xslt.transform(cs, input, function(err, result) {
      console.log('The result of the transformation is %s', result);
    });
    
    // Transformation with parameters
    xslt.transform(cs, input, 
      { foo: 'foo', bar: 123 },
      function(err, result) {
        console.log('The result of the transformation is %s', result);
    });

## Functions

    compileStylesheet(stylesheet)
    
Parses the specified XSLT stylesheet for future processing. "stylesheet"
must be a string or a Buffer.

Compiling a stylesheet is an expensive operation. For best results, compile
it once when the application is started, and re-use it for multiple 
transformations.

    transform(compiledStylesheet, document, parameters, callback)
    
Transforms the XML based on the stylesheet. The stylesheet must previously
have been compiled using "compileStylesheet."

If specified, "parameters" must be an object. Each property in the object
will be passed as a parameter to the XSLT engine, so that it may be retrieved
usign the "xsl:param" tag.

If "callback" is specified and a function, then the processing may proceed
asynchronously. The result will be delivered via the callback. The first 
argument will be an Error if processing fails, and undefined otherwise.
The second will be a string that represents the output of the transformation.

    setTransformer(transformerClass)
    
Specifies which Java class to use for XSLT transformation. 

## Trireme Operation

When using this module on Trireme, XSLT processing is handled by the
platform's "TransformerFactory." A different transformer may be specified
by calling "setTransformer". If a callback is used, then "transform"
runs the XSLT in a thread pool, so it can take advantage of multiple CPU
cores.

Within Trireme, the number of concurrent XSLT processing jobs is limited to
8 in order to avoid blowing up the thread pool in extreme situations.
This default may be adjusted by setting the Java system property
"trireme.max.xslt.jobs".

## Local Operation

When using this module outside Trireme, all features are implemented using
the "node_xslt" module, which under the covers uses "libxslt." 
Outside Trireme, all transformations are performed synchronously.

