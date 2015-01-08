# AdBlock Plus Extensions Archeology Findings

Sources for Google Chrome extensions can be found at https://github.com/adblockplus/adblockpluschrome. Sadly, these sources are not everything you need to actually build the Chrome extension. See https://github.com/adblockplus/buildtools and/or try to find documentation o how to build it. I failed at that (granted I didn't spend too much time on it, because we can work with an unpacked CRX).

I suspect we will need help from the ABP guys in order to build the actual (unpreprocessed) sources.

Anyways, CRXs are available from https://downloads.adblockplus.org/devbuilds/adblockpluschrome/

My personal ABP playground repo lives at https://github.com/realyze/abp-playground . It's the sources of the unpacked CRX (1.8.3 version).
The code is a bit ouf of date by now but the codebase doesn't seem to be undergoing major refactoring anyway, plus what we're doing can be descried as "exploratory testing" (checking whether it's feasible to run/port ABP to Kitt) so we don't necessarily care about the up-to-date sources at this stage (although we will once we determine  the changes that need to be made and we will want to stat folding our changes back).

Git branch with the latest code is https://github.com/realyze/abp-playground/tree/adblock-new.

# Code Structure
The extension code is a Firefox extension with a compatibility layer(s) slapped on top of it. See e.g. `lib/compat.js`.

The intereresting parts I have identified so far are `lib/io.js` which will most probably need to be rewritten
from scratch by us (as it accesses the file system in quite a complicated way).

I have changed that code quite heavily and hackily, I'm afraid - I wanted to workaround the non-working code 
there to see how the actual blocking logic works in Kitt (and I'm fairly confident although solving 
the FS access might be technically challening, it is doable and not a deal breaker).

The other interesting part is `webrequest.js` which is where we intercept the
HTTP requests and delegate the rule matching work to `lib/adblockplus.js` (AKA
the behemoth) which is an automatically generated module with, well, frankly,
all the core ABP functionality. Of special interest is the `CombinedMatcher`
class which is used to determine whether a rule blocking (or whitelisting) rule
applies for a given URL within a frame.

### `patterns.ini` file
Most of the rules is loaded from `patterns.ini` file which is (in the Chrome
extension) downloaded from the Internet and stored in the FS (chrome extension
storage directory). Unfortunately we can't do that in Kitt so for now I've just
copied the file to the extensions root and we're loading it via the `kitt://`
URL as a static resource. The file is fairly big (50000+ rules) and it was being parsed
synchronously which made Kitt choke when tried on a simulator (both CPU and memory were
spiking).

I changed the loading to use a (fairly basic) asynchronous algorithm and we're
parsing in 10000 chunks which takes cca 5 seconds altogether. 
**UPDATE**: Strangely enough, I can't reproduce the choking now anymore even when
I replace the async code with the original sync code. Explanation unknown (sun
spots, aliens or the choking was caused by something weird happening in the
simulator?)
