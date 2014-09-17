# dat-github-trending

GitHub trending data for [dat](https://github.com/maxogden/dat).

`dat-github-trending` works as a dat listen hook. Install dat, create an empty one and install `dat-github-trending` afterwards.

```sh
npm install -g dat
mkdir dat-github-trending
cd dat-github-trending
dat init # put in your info
npm install dat-github-trending
```

When done, install the hook in your `dat.json`.

``` json
{
  "hooks": {
    "listen": "dat-npm"
  }
}
```

That's all. Execute `dat listen` and the GitHub trending repository data (all languages) will be flow into your dat on every single day.

## License

The MIT License (MIT)

Copyright (c) 2014 André König, Germany

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
