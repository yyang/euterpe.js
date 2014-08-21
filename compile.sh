#/bin/bash

cat js/core/apollo-index.js > euterpe.full.js
cat js/core/pub.js >> euterpe.full.js
cat js/core/uuid.js >> euterpe.full.js
cat js/core/registry.js >> euterpe.full.js
cat js/core/color.js >> euterpe.full.js
cat js/core/graph.js >> euterpe.full.js
cat js/core/action.js >> euterpe.full.js

java -jar compiler.jar --js euterpe.full.js --js_output_file euterpe.js --language_in=ECMASCRIPT5_STRICT --compilation_level SIMPLE_OPTIMIZATIONS
