---
title: "CSP Series"
slug: "csp-series"
chapter: "attacks"
priority: 4
editor: "markdown"
revisionCount: 1
id: 80
createdAt: "2022-09-24T00:48:58Z"
createdBy: "mxrch"
updatedAt: "2022-09-24T00:53:57Z"
updatedBy: "mxrch"
ownedBy: "mxrch"
views: 2
---
<h1>1. Intro</h1>
<p id="bkmrk-csp-%28content-securit">CSP (Content Security Policy) is there / in-place to mitigate some attacks, such as xss, csrf. It behaves as a whitelist mechanism for resources loaded or executed on the website, and is defined by HTTP headers or meta elements.</p>
<p id="bkmrk-although-csp-provide">Although CSP provides strong security protection, it also causes the following problems:</p>
<ol id="bkmrk-eval-and-related-fun"><li>Eval and related functions are disabled</li>
<li>embedded JavaScript code will not be executed</li>
<li>remote scripts can only be loaded through whitelisting</li>
</ol><p id="bkmrk-these-problems-hinde">These problems hinder the popularity of CSP. If you want to use CSP technology to protect your website, developers have to spend a lot of time separating the embedded JavaScript code and making some adjustments...<a id="bkmrk-" class="anchor" href="https://github.com/OlivierLaflamme/Auditing-Vulnerabilities/blob/master/CSP/CSP.md#browsers-that-support-csp" aria-hidden="true"><svg class="octicon octicon-link" viewbox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"></svg></a></p>
<h3 id="bkmrk-browsers-that-suppor">Browsers that support CSP</h3>
<p id="bkmrk-csp-mainly-has-three">CSP mainly has three headers:</p>
<ol id="bkmrk-content-security-pol"><li>Content-Security-Policy (chrome 25+，Firefox 23+，Opera 19+)</li>
<li>X-Content-Security-Policy (Firefox 23+，IE10+)</li>
<li>X-WebKit-CSP (Chrome 25+)</li>
</ol><p id="bkmrk-the-csps-we-often-se">The CSPs we often see are similar to this:</p>
<pre id="bkmrk-header%28%22content-secu"><code class="language-">header("Content-Security-Policy:default-src 'none'; 
connect-src 'self'; 
frame-src 'self'; 
script-src xxxx/js/ 'sha256-KcMxZjpVxhUhzZiwuZ82bc0vAhYbUJsxyCXODP5ulto=' 'sha256-u++5+hMvnsKeoBWohJxxO3U9yHQHZU+2damUA6wnikQ=' 'sha256-zArnh0kTjtEOVDnamfOrI8qSpoiZbXttc6LzqNno8MM=' 'sha256-3PB3EBmojhuJg8mStgxkyy3OEJYJ73ruOF7nRScYnxk=' 'sha256-bk9UfcsBy+DUFULLU6uX/sJa0q7O7B8Aal2VVl43aDs=';
font-src xxxx/fonts/ fonts.gstatic.com; 
style-src xxxx/css/ fonts.googleapis.com; 
img-src 'self'");</code></pre>
<p id="bkmrk-as-you-can-see-it-co">As you can see it contains a wide variety of wording:</p>
<ol id="bkmrk-none-and-self%2C-none-"><li>none and self, none of what the representative does not match, self representatives of matching homologous source</li>
<li>is similar matches such <a href="https://example.com/path/to/file.js" rel="nofollow">https://example.com/path/to/file.js</a> special file, or https: //example.com/ This will match everything under the source.<br>3.The third one is similar to https: and will match all sources that contain this special format.</li>
<li>It may also be example.com, which will match all sources of this host, or * .example.com, which will match all subdomains of this host.</li>
<li>The fifth is similar to nonce-qwertyu12345, which will match a special node.</li>
<li>Of course, there is encrypted similar to sha256-abcd ... It will also match a special node in the page (this value will change every time you modify it).</li>
</ol><p id="bkmrk-a-detailed-example-c">A detailed example can be found in the documentation:</p>
<pre id="bkmrk-serialized-source-li"><code class="language-">serialized-source-list = ( source-expression *( RWS source-expression ) ) / "'none'"
source-expression      = scheme-source / host-source / keyword-source
                        / nonce-source / hash-source
; Schemes:
scheme-source = scheme ":" ; scheme is defined in section 3.1 of RFC 3986.

; Hosts: "example.com" / "*.example.com" / "https://*.example.com:12/path/to/file.js"
host-source = [ scheme-part "://" ] host-part [ port-part ] [ path-part ]
scheme-part = scheme
host-part   = "*" / [ "*." ] 1*host-char *( "." 1*host-char )
host-char   = ALPHA / DIGIT / "-"
port-part   = ":" ( 1*DIGIT / "*" )
path-part   = path
             ; path is defined in section 3.3 of RFC 3986.
 
; Keywords:
keyword-source = "'self'" / "'unsafe-inline'" / "'unsafe-eval'"

; Nonces: 'nonce-[nonce goes here]'
nonce-source  = "'nonce-" base64-value "'"
base64-value  = 1*( ALPHA / DIGIT / "+" / "/" / "-" / "_" )*2( "=" )

; Digests: 'sha256-[digest goes here]'
hash-source    = "'" hash-algorithm "-" base64-value "'"
hash-algorithm = "sha256" / "sha384" / "sha512"</code></pre>
<p id="bkmrk-there-is-a-small-que">There is a small question about using IP… <br>Although the use of IP conforms to the above syntax, the security of requests directly to the ip address is itself in doubt, and if it is possible, it is better to use the domain name.</p>
<h3 id="bkmrk-in-general">In General</h3>
<p id="bkmrk-the-csp-detection-me">The CSP detection method is to first determine the specific request type, and then return the name of a valid instruction in the following way. Depending on the type of the request, the following different steps will be performed:</p>
<p id="bkmrk-to-understand-the-fo">To understand the following algorithm, we first need to know what is the originator of the request</p>
<p id="bkmrk-a%29-initiator%3A-each-r">A) Initiator: Each request has an initiator, including "download", "imageset", "manifest", or "xslt".<br>B) Destination: Each request has a corresponding destination, including "document", "embed", "font", "image", "manifest", "media", "object", "report", "script", “Serviceworker”, “sharedworker”, “style”, “worker”, or “xslt”.</p>
<ol id="bkmrk-if-the-request%E2%80%99s-ini"><li>If the request’s initiator is “fetch”, return connect-src.</li>
<li>If the request’s initiator is “manifest”, return manifest-src.</li>
<li>If the request’s destination is “subresource”, return connect-src.</li>
<li>If the request’s destination is “unknown”, return object-src.</li>
<li>If the request’s destination is “document” and the request’s target browsing context is a nested browsing context: return child-src.</li>
<li>Audio” -&gt; “track” -&gt; “vide, return media-src.</li>
<li>font, return font-src.</li>
<li>image, return image-src.</li>
<li>style, return style-src.</li>
</ol>
<br>
<h1>2. Prevention</h1>
<p id="bkmrk-csp-is-especially-im">CSP is especially important for your users: they no longer need to be exposed to any unsolicited script, content or XSS threats on your website.</p>
<p id="bkmrk-the-most-important-a">The most important advantage of a CSP for a website maintainer is perception. If you set strict rules on the source of the picture, a script kid tries to insert an image of an unauthorized source on your website, then the picture will be banned, and you will receive a reminder as soon as possible .</p>
<p id="bkmrk-developers-also-need">Developers also need to know exactly what their front-end code is doing, and CSP can help them control everything. Will prompt them to refactor parts of their code (avoid inline functions and styles, etc.) and prompt them to follow best practices.</p>
<h4 id="bkmrk-%C2%A0"> </h4>
<h4 id="bkmrk-there-are-a-few-simp">There are a few simple ways to prevent CSP based attacks.</h4>
<p id="bkmrk-adding-policies-thro">Adding policies through meta tags: The preferred setting method for CSP is the HTTP header, which is very useful, but it is more straightforward to set through tags or scripts. WebKit has implemented the feature of setting permissions through meta elements , so you can now try the following settings in Chrome: add &lt;metahttp-equiv = "X-WebKit-CSP" content = "[POLICY GOES HERE]" in the header of the document &gt;.</p>
<p id="bkmrk-dom-api%3A-if-this-fea">DOM API: If this feature is added in the next iteration of CSP, you can query the current security policy of the page through Javascript and adjust it according to different situations. For example, if eval () is available, your code implementation may be slightly different.</p>
<p id="bkmrk-%C2%A0-0"> </p>
<h4 id="bkmrk-content-security-pol">Content security policy applies to all common resources</h4>
<ol start="3" id="bkmrk-content-src%3A-limit-t"><li>content-src: limit the type of connection (such as XHR, WebSockets, and EventSource)</li>
<li>font-src: Controls the source of web fonts. For example, you can use Google's web fonts through font-src</li>
<li>img-src: defines the source of the loadable image.</li>
<li>media-src: Restrict video and audio sources.</li>
<li>object-src: Restrict sources of Flash and other plugins.</li>
<li>style-src: Similar to Script-src, but only works on css files.</li>
</ol><h4 id="bkmrk-%C2%A0-1"> </h4>
<h4 id="bkmrk-under-the-csp-1-spec">Under the CSP 1 specification, you can also set the following rules:</h4>
<ol id="bkmrk-img-src-valid-image-"><li>img-src Valid image source</li>
<li>connect-src Apply to XMLHttpRequest (AJAX), WebSocket or EventSource</li>
<li>font-src Valid font source</li>
<li>object-src Effective plug-in source (eg, , , )</li>
<li>media-src Valid and source</li>
</ol><h4 id="bkmrk-the-csp-2-specificat">The CSP 2 specification contains the following rules:</h4>
<ol id="bkmrk-child-src-valid-web-"><li>child-src Valid web workers and element sources, such as and &lt;iframe&gt; (this directive replaces the obsolete frame-src directive in CSP 1 )</li>
<li>form-action Can be a valid source of HTML actions</li>
<li>frame-ancestors Use , &lt;iframe&gt;, , or useful source embedded resources</li>
<li>upgrade-insecure-requests Command the user agent to rewrite the URL protocol and change HTTP to HTTPS (for some websites that need to rewrite a lot of stale URLs).</li></ol>
<br>
<h1>3. CTF CONTEXT</h1>

<h3 id="bkmrk-common-attack-surfac">Common attack surface</h3>
<p id="bkmrk-script-src-%3A-script%3A">script-src : script: only trust the current domain name<br>object-src : Do not trust any URL, ie do not load any resources<br>style-src : stylesheet: trust only cdn.example.org and third-party.org<br>child-src : Must be loaded using the HTTPS protocol. This has been removed from the web standard and may not be supported in newer browsers.</p>
<p id="bkmrk-other-resources%3A-no-">Other resources: no restrictions on other resources</p>
<p id="bkmrk-when-csp-is-enabled%2C">When CSP is enabled, non-CSP-compliant external resources are prevented from loading.</p>
<h4 id="bkmrk-example-1%3A">Example 1:</h4>
<p id="bkmrk-a-fair-amount-of-csp">A fair amount of CSP's can be detected purely from source, lets look at the source code:</p>
<pre id="bkmrk-%3C%3Fphp-%24headercsp-%3D-%22"><code class="language-php">&lt;?php

$headerCSP = "Content-Security-Policy: script-src 'self' 'unsafe-inline' 'nonce-TmV2ZXIgZ29pbmcgdG8gZ2l2ZSB5b3UgdXA=';";

header($headerCSP);

// Disable XSS protections so that inline alert boxes will work
header ("X-XSS-Protection: 0");

&lt;script nonce="TmV2ZXIgZ29pbmcgdG8gZ2l2ZSB5b3UgdXA="&gt;alert(1)&lt;/script&gt;

?&gt;
&lt;?php
if (isset ($_POST['include'])) {
$page[ 'body' ] .= "
    " . $_POST['include'] . "
";
}
$page[ 'body' ] .= '
&lt;form name="csp" method="POST"&gt;
    &lt;p&gt;Whatever you enter here gets dropped directly into the page, see if you can get an alert box to pop up.&lt;/p&gt;
    &lt;input size="50" type="text" name="include" value="" id="include" /&gt;
    &lt;input type="submit" value="Include" /&gt;
&lt;/form&gt;
';</code></pre>
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-05/NZZXfmrqgns7hSI6-CSP.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/NZZXfmrqgns7hSI6-CSP.PNG" alt="CSP.PNG" width="802" height="167"></a></p>
<p id="bkmrk-you-can-see-there-ar">You can see there are <code>nonce</code> and <code>unsafe-inline</code> here I think the inspection point is the understanding of the parameters (special values) in the script-src moreover, The legal source of script-src in the http header has changed.</p>
<ol id="bkmrk-unsafe-inline%2C-which"><li>unsafe-inline, which allows the use of inline resources such as inline &lt;script&gt; elements, javascript: URLs, inline event handlers (such as onclick), and inline &lt;style&gt; elements. Must include single quotes.</li>
<li>nonce-source, only specific inline script blocks are allowed, nonce = "TmV2ZXIgZ29pbmcgdG8gZ2l2ZSB5b3UgdXA"</li>
</ol><p id="bkmrk-basically....-it%27s-e">Basically.... It's even easier now, you can enter the following code directly:<br><code>&lt;script nonce="TmV2ZXIgZ29pbmcgdG8gZ2l2ZSB5b3UgdXA="&gt;alert("document.cookie")&lt;/script&gt;</code></p>
<p id="bkmrk-the-result-is-a-succ">The result is a successful injection.</p>
<p id="bkmrk--0"><a href="/uploads/images/gallery/2020-05/vqozUeeNjzBMMVvM-CSP1.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/vqozUeeNjzBMMVvM-CSP1.PNG" alt="CSP1.PNG" width="810" height="124"></a></p>
<p id="bkmrk-%C2%A0-3"> </p>
<p id="bkmrk-by%3A-boschko"><strong>By: Olivier (Boschko) Laflamme<br></strong></p>
<ul id="bkmrk-twitter%3A-https%3A%2F%2Ftwi"><li>Twitter: <a href="https://twitter.com/olivier_boschko">https://twitter.com/olivier_boschko</a></li>
<li>LinkedIn: <a href="https://www.linkedin.com/in/olivierlaflammelink/">https://www.linkedin.com/in/olivierlaflammelink/</a></li>
</ul><p id="bkmrk-%C2%A0-14"> </p>
