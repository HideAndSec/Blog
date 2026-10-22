---
title: "The RC4 encryption"
slug: "the-rc4-encryption"
priority: 5
editor: "wysiwyg"
revisionCount: 2
id: 50
createdAt: "2020-09-05T21:31:32Z"
createdBy: "boschko"
updatedAt: "2020-09-05T21:55:11Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 9
---
<p id="bkmrk-the-rc4-encryption-a">The RC4 encryption algorithm is a symmetric encryption algorithm.</p>
<h2 id="bkmrk-symmetric-encryption">Symmetric encryption algorithm</h2>
<p id="bkmrk-symmetric-encryption-0">Symmetric encryption (also called private key encryption) refers to an encryption algorithm that uses the same <a href="http://baike.baidu.com/view/934.htm" target="_blank" rel="noopener">key</a> for encryption and decryption . Sometimes called the traditional cryptographic algorithm, the encryption key can be calculated from the decryption key, and the decryption key can also be calculated from the encryption key. In most symmetric algorithms, the encryption key and the decryption key are the same, so this encryption algorithm is also called a secret key algorithm or a single key algorithm. It requires the sender and receiver to agree on a key before communicating securely. The security of the symmetric algorithm depends on the key. Leaking the key means that anyone can decrypt the messages they send or receive, so the confidentiality of the key is very important to the security of communication.</p>
<h2 id="bkmrk-rc4-encryption-algor">RC4 encryption algorithm</h2>
<p id="bkmrk-rc4-algorithm-is-cha">RC4 algorithm is characterized by simple algorithm, fast running speed, and the key length is variable, the variable range is 1-256 bytes (8-2048 bits), under the premise of technical support today, when the key length is At 128 bits, it is not feasible to search for keys by brute force, so it can be predicted that the key range of RC4 can still resist brute force search key attacks for a long time in the future. In fact, no effective attack method has been found for the 128bit key length RC4 encryption algorithm.</p>
<div id="bkmrk-the-principle-of-rc4">The principle of RC4 algorithm is very simple, including initialization algorithm (KSA) and pseudo-random sub-code generation algorithm (PRGA) two parts. Assume that the length of the S-box is 256 and the key length is Len. </div>
<div id="bkmrk-"></div>
<div id="bkmrk-let%27s-take-a-look-at">Let's take a look at the initialization part of the algorithm (in C code):</div>
<div id="bkmrk--0"></div>
<div id="bkmrk-among-the%3A">Among the:</div>
<div id="bkmrk-parameter-1-is-a-256">Parameter 1 is a 256-length char type array, defined as: unsigned char sBox[256];</div>
<div id="bkmrk-parameter-2-is-the-k">Parameter 2 is the key, and its content can be defined arbitrarily: char key[256];</div>
<div id="bkmrk-parameter-3-is-the-l">Parameter 3 is the length of the key, Len = strlen(key);</div>
<div id="bkmrk--1"></div>
<div id="bkmrk--2"></div>
<pre id="bkmrk-%2F%2A-initialization-fu"><code class="language-C">/* Initialization function */ 
void rc4_init(unsigned char *s,unsigned char *key, unsigned long Len)
{
    int i = 0 ,j = 0 ;
     char k[ 256 ]={ 0 };
    unsigned char tmp = 0 ;
     for (i = 0 ;i&lt; 256 ;i++ ) {
        s[i] = i;
        k[i] =key[i% Len];
    }
    for (i= 0 ;i&lt; 256 ;i++ ) {
        j =(j+s[i]+k[i])% 256 ;
        tmp = s[i];
        s[i] = s[j]; // Exchange s[i] and s[j] 
        s[j]= tmp;
    }
}</code></pre>
<div id="bkmrk--3"></div>
<div id="bkmrk-during-the-initializ">
<div><span style="vertical-align: inherit;">During the initialization process, the main function of the </span><a style="color: #336699; text-decoration: none; background: transparent;" href="http://baike.baidu.com/view/934.htm" target="_blank" rel="noopener"><span style="vertical-align: inherit;">key</span></a><span style="vertical-align: inherit;"> is to scramble the S-box, i ensure that each element of the S-box is processed, and j ensures that the scramble of the S-box is random. Different S-boxes can obtain different sub-key sequences after being processed by the </span><a style="color: #336699; text-decoration: none; background: transparent;" href="http://baike.baidu.com/view/3137884.htm" target="_blank" rel="noopener"><span style="vertical-align: inherit;">pseudo-random</span></a><span style="vertical-align: inherit;"> sub-cipher generation algorithm. Perform an xor operation on the S-box and the plaintext to obtain the ciphertext, and the decryption process is exactly the same.</span></div>
<div></div>
<div><span style="vertical-align: inherit;">Let's take a look at the encryption part of the algorithm (in C code):</span></div>
<div></div>
<div><span style="vertical-align: inherit;">Among them.</span></div>
<div><span style="vertical-align: inherit;">Parameter 1 is the disturbed S-box in the rc4_init function above;</span></div>
<div><span style="vertical-align: inherit;">Parameter 2 is the data data that needs to be encrypted;</span></div>
<div><span style="vertical-align: inherit;">Parameter 3 is the length of data.</span></div>
</div>
<div id="bkmrk--4"></div>
<pre id="bkmrk-%2F%2A-encryption-and-de"><code class="language-C">/* Encryption and decryption */ 
void rc4_crypt(unsigned char *s,unsigned char *Data,unsigned long Len)
{
    int i = 0 , j = 0 , t = 0 ;
    unsigned long k = 0 ;
    unsigned char tmp;
     for (k = 0 ;k&lt;Len;k++ )
    {
        i = (i + 1 )% 256 ;
        j =(j+s[i])% 256 ;
        tmp = s[i];
        s[i] = s[j]; // Swap s[x] and s[y] 
        s[j]= tmp;
        t =(s[i]+s[j])% 256 ;
        Data[k] ^= s[t];
    }
}</code></pre>
<div id="bkmrk-let%27s-take-a-look-at-0">Let's take a look at the complete program</div>
<div id="bkmrk--5"></div>
<pre id="bkmrk-%2F%2F-program-start-%23in"><code class="language-C">// Program start 
#include&lt;stdio.h&gt; 
#include &lt; string .h&gt;
typedef unsigned longULONG;
 
/* Initialization function */ 
void rc4_init(unsigned char *s, unsigned char *key, unsigned long Len)
{
    int i = 0 , j = 0 ;
     char k[ 256 ] = { 0 };
    unsigned char tmp = 0 ;
     for (i = 0 ; i&lt; 256 ; i++ )
    {
        s[i] = i;
        k[i] = key[i% Len];
    }
    for (i = 0 ; i&lt; 256 ; i++ )
    {
        j = (j + s[i] + k[i])% 256 ;
        tmp = s[i];
        s[i] = s[j]; // Swap s[i] and s[j] 
        s[j] = tmp;
    }
}
 
/* Encryption and decryption */ 
void rc4_crypt(unsigned char *s, unsigned char *Data, unsigned long Len)
{
    int i = 0 , j = 0 , t = 0 ;
    unsigned long k = 0 ;
    unsigned char tmp;
     for (k = 0 ; k&lt;Len; k++ )
    {
        i = (i + 1 )% 256 ;
        j = (j + s[i])% 256 ;
        tmp = s[i];
        s[i] = s[j]; // Swap s[x] and s[y] 
        s[j] = tmp;
        t = (s[i] + s[j])% 256 ;
        Data[k] ^= s[t];
    }
}
 
int main()
{
    unsigned char s[ 256 ] = { 0 }, s2[ 256 ] = { 0 }; // S-box 
    char key[ 256 ] = { " justfortest " };
     char pData[ 512 ] = " This is an encryption Data " ;
    unsigned long len = strlen(pData);
     int i;
 
    printf( " pData=%s\n " , pData);
    printf( " key=%s,length=%d\n\n " , key, strlen(key));
    rc4_init(s, (unsigned char *)key, strlen(key)); // Has completed the initialization 
    printf( " Complete the initialization of S[i], as follows: \n\n " );
     for (i = 0 ; i&lt; 256 ; i++ )
    {
        printf( " %02X " , s[i]);
         if (i &amp;&amp; (i + 1 )% 16 == 0 )putchar( ' \n ' );
    }
    printf( " \n\n " );
     for (i = 0 ; i&lt; 256 ; i++) // Use s2[i] to temporarily reserve the initialized s[i], it is very important! ! ! 
    {
        s2[i] = s[i];
    }
    printf( " Initialized, now encrypted:\n\n " );
    rc4_crypt(s, (unsigned char *)pData, len); // Encryption 
    printf( " pData=%s\n\n " , pData);
    printf( " Already encrypted, now decrypt:\n\n " );
     // rc4_init(s,(unsignedchar*)key,strlen(key)); // initialize the key 
    rc4_crypt(s2, (unsigned char *)pData, len); // Decrypt 
    printf( " pData=%s\n\n " , pData);
     return  0 ;
}
 
//The program is over</code></pre>
<div id="bkmrk--6"></div>
<h4 id="bkmrk-by-boschko">By Boschko</h4>
<div id="bkmrk-my-hack-the-box%3A-htt">
<div>
<ul id="bkmrk-my-hack-the-box%3A-htt-0"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure></div>
</div>
<p id="bkmrk-%C2%A0-2"> </p>
