# Contract corpus

`contract/cases.json` is the shared Mist Engine v1 conformance manifest. Resolve every case relative to `corpus/contract`, select its qualified codec from `MIST_ENGINE_CODECS`, and compare normalized values after `parse → stringify → parse`.

`canonical` is the strict package expectation. `lantern` describes form import/export behavior. `handbook` describes tolerant rendering behavior; `null` means the format has no renderer and only the installed canonical codec is exercised.
