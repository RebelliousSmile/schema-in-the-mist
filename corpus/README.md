# Contract corpus

`contract/cases.json` is the shared Mist Engine v1 conformance manifest. Resolve every case relative to `corpus/contract`, select its qualified codec from `MIST_ENGINE_CODECS`, and compare normalized values after `parse → stringify → parse`.

`canonical` is the strict package expectation and is verified here through both Zod and the generated JSON Schema. `handbook` is declarative, consumer-owned rendering expectation metadata: Handbook verifies it through its own installed render path. `null` means the format has no renderer and only the installed canonical codec is exercised.
