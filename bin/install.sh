#!/bin/sh
mkdir -p blocks/i-jquery/_dummy
ln -sf ../../../node_modules/bem-bl/blocks-common/i-jquery/_dummy/i-jquery_dummy_yes.js blocks/i-jquery/_dummy/i-jquery_dummy_yes.server.js

mkdir -p blocks/i-jquery/__identify
ln -sf ../../../node_modules/bem-bl/blocks-common/i-jquery/__identify/i-jquery__identify.js blocks/i-jquery/__identify/i-jquery__identify.server.js

mkdir -p blocks/i-jquery/__inherit
ln -sf ../../../node_modules/bem-bl/blocks-common/i-jquery/__inherit/i-jquery__inherit.js blocks/i-jquery/__inherit/i-jquery__inherit.server.js

mkdir -p blocks/i-jquery/__is-empty-object
ln -sf ../../../node_modules/bem-bl/blocks-common/i-jquery/__is-empty-object/i-jquery__is-empty-object.js blocks/i-jquery/__is-empty-object/i-jquery__is-empty-object.server.js

mkdir -p blocks/i-jquery/__observable
ln -sf ../../../node_modules/bem-bl/blocks-common/i-jquery/__observable/i-jquery__observable.js blocks/i-jquery/__observable/i-jquery__observable.server.js

ln -sf ../../node_modules/bem-bl/blocks-common/i-bem/i-bem.js blocks/i-bem/i-bem.server.js

mkdir -p blocks/i-bem/__json
ln -sf ../../../node_modules/bem-json/i-bem/__json/i-bem__json.js blocks/i-bem/__json/i-bem__json.priv.js

mkdir -p blocks/i-bem/__json/_async
ln -sf ../../../../node_modules/bem-json/i-bem/__json/_async/i-bem__json_async_yes.js blocks/i-bem/__json/_async/i-bem__json_async_yes.priv.js

mkdir -p blocks/i-bem/__html
ln -sf ../../../node_modules/bem-json/i-bem/__html/i-bem__html.js blocks/i-bem/__html/i-bem__html.priv.js

ln -sf ../../node_modules/vow/lib/vow.js blocks/i-promise/i-promise.js
