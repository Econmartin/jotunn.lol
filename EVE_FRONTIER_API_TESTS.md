# EVE Frontier API Tests — Stillness Environment

Tested: 2026-03-15

**Key data used:**
- Character ID (Jotunn): `0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a`
- Wallet: `0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b`
- Item/Type ID: `2112077867`
- Tribe ID: `98000430`
- World Package ID: `0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c`

---

## A. Sui GraphQL API

Base URL: `https://graphql.testnet.sui.io/graphql`

> **Note:** All `0x`-prefixed hex strings must be passed as JSON variable values, not interpolated directly into the query string via curl's `-d '...'` flags. Use a JSON file (`-d @file.json`) to avoid shell escape issues.

---

## A1. Get Character Object (Jotunn)

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
      "version": 794564890,
      "digest": "UThe9hs3MAgKdVy1WPfD7hZZHaRF5aoin4WDbPYTtgD",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::character::Character"
          },
          "json": {
            "id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
            "key": {
              "item_id": "2112077867",
              "tenant": "stillness"
            },
            "tribe_id": 98000430,
            "character_address": "0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b",
            "metadata": {
              "assembly_id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
              "name": "War Admiral Jotunn",
              "description": "",
              "url": ""
            },
            "owner_cap_id": "0x2fcc117462907a5b51bb279fa3602464ec95487f7dba80a02d6dc8736a8bfa97"
          }
        },
        "dynamicFields": {
          "nodes": []
        }
      }
    }
  }
}
```

---

## A2. Get Owned Objects by Wallet

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "objects": {
      "nodes": [
        {
          "address": "0xe666ac815f64c1dda8389c51444d8b33ff7e8a2364aefe4d373edb757a5b5593",
          "version": 792357393,
          "asMoveObject": {
            "contents": {
              "json": {
                "id": "0xe666ac815f64c1dda8389c51444d8b33ff7e8a2364aefe4d373edb757a5b5593",
                "character_id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a"
              },
              "type": {
                "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::character::PlayerProfile"
              }
            }
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": false,
        "endCursor": "UrCGEgAAAACQAQCA31APfrmHNTG9..."
      }
    }
  }
}
```

> Note: Only 1 object returned — the `PlayerProfile`. The `Character` object itself is owned by the world contract, not the wallet directly.

---

## A3. Get Transactions for Wallet

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "transactions": {
      "nodes": [
        {
          "digest": "E31diSHbxcDoJKkvR8xFAYwj7Acqfbmbogwuj7aQ1spJ",
          "effects": {
            "status": "SUCCESS",
            "timestamp": "2026-03-11T20:20:00.418Z"
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": false,
        "endCursor": "MzMyOTA3MjIwMA=="
      }
    }
  }
}
```

---

## A4. Get Transaction Events for Character

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "transactions": {
      "nodes": [
        {
          "digest": "E31diSHbxcDoJKkvR8xFAYwj7Acqfbmbogwuj7aQ1spJ",
          "effects": {
            "status": "SUCCESS",
            "timestamp": "2026-03-11T20:20:00.418Z",
            "events": {
              "nodes": [
                {
                  "contents": {
                    "json": {
                      "owner_cap_id": "0x2fcc117462907a5b51bb279fa3602464ec95487f7dba80a02d6dc8736a8bfa97",
                      "authorized_object_id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a"
                    },
                    "type": {
                      "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::access::OwnerCapCreatedEvent"
                    }
                  },
                  "timestamp": "2026-03-11T20:20:00.418Z"
                },
                {
                  "contents": {
                    "json": {
                      "assembly_id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
                      "assembly_key": { "item_id": "2112077867", "tenant": "stillness" },
                      "name": "War Admiral Jotunn",
                      "description": "",
                      "url": ""
                    },
                    "type": {
                      "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::metadata::MetadataChangedEvent"
                    }
                  },
                  "timestamp": "2026-03-11T20:20:00.418Z"
                },
                {
                  "contents": {
                    "json": {
                      "character_id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
                      "key": { "item_id": "2112077867", "tenant": "stillness" },
                      "tribe_id": 1000167,
                      "character_address": "0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b"
                    },
                    "type": {
                      "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::character::CharacterCreatedEvent"
                    }
                  },
                  "timestamp": "2026-03-11T20:20:00.418Z"
                }
              ]
            }
          }
        }
      ],
      "pageInfo": { "hasNextPage": false, "endCursor": "MzMyOTA3MjIwMA==" }
    }
  }
}
```

---

## A5. Get Object Version History (Character)

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "objectVersions": {
      "nodes": [
        {
          "version": 792357393,
          "digest": "A2LFR7XXHu674ZoSh7vJdG4UcT18zAu54bQWJyTmShhj",
          "asMoveObject": {
            "contents": {
              "json": {
                "id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
                "key": { "item_id": "2112077867", "tenant": "stillness" },
                "tribe_id": 1000167,
                "character_address": "0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b",
                "metadata": {
                  "assembly_id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
                  "name": "War Admiral Jotunn",
                  "description": "",
                  "url": ""
                },
                "owner_cap_id": "0x2fcc117462907a5b51bb279fa3602464ec95487f7dba80a02d6dc8736a8bfa97"
              }
            }
          }
        },
        {
          "version": 794564889,
          "digest": "CU7RWKLVohZizHWfEMEAHJg5RssZqGHgoW8gszMEsfwJ",
          "asMoveObject": { "contents": { "json": { "tribe_id": 98000430 } } }
        },
        {
          "version": 794564890,
          "digest": "UThe9hs3MAgKdVy1WPfD7hZZHaRF5aoin4WDbPYTtgD",
          "asMoveObject": { "contents": { "json": { "tribe_id": 98000430 } } }
        }
      ],
      "pageInfo": { "hasNextPage": false }
    }
  }
}
```

> Note: 3 versions total — initial creation (tribe 1000167), then two updates setting tribe to 98000430.

---

## A6. Get All Killmail Objects (filter by type)

**Status:** ✅ Success

**Sample Response (first 2 of 5):**
```json
{
  "data": {
    "objects": {
      "nodes": [
        {
          "address": "0x01ccdbf17557ba6c95a66dc5c1e802e08ee35a41e8e4318e1b9efbd702e5fb36",
          "version": 793646414,
          "digest": "6ZGV2deYZsc9nvaNJy3ifsFVmknJhPnGpcGKdZsiqkfr",
          "asMoveObject": {
            "contents": {
              "json": {
                "id": "0x01ccdbf17557ba6c95a66dc5c1e802e08ee35a41e8e4318e1b9efbd702e5fb36",
                "key": { "item_id": "359", "tenant": "stillness" },
                "killer_id": { "item_id": "2112078867", "tenant": "stillness" },
                "victim_id": { "item_id": "2112077577", "tenant": "stillness" },
                "reported_by_character_id": { "item_id": "2112078867", "tenant": "stillness" },
                "kill_timestamp": "1773366264",
                "loss_type": { "@variant": "STRUCTURE" },
                "solar_system_id": { "item_id": "30016318", "tenant": "stillness" }
              }
            }
          }
        },
        {
          "address": "0x0a5fa35f3f255994150293f4105e1cff60471e1e400f8d934659c79edaac0544",
          "version": 793435553,
          "digest": "GzYRaPdPhA8177e7G4ETLE5t4cnAeRhEbdDtA2YZpi2L",
          "asMoveObject": {
            "contents": {
              "json": {
                "id": "0x0a5fa35f3f255994150293f4105e1cff60471e1e400f8d934659c79edaac0544",
                "key": { "item_id": "314", "tenant": "stillness" },
                "killer_id": { "item_id": "2112077648", "tenant": "stillness" },
                "victim_id": { "item_id": "2112078428", "tenant": "stillness" },
                "reported_by_character_id": { "item_id": "2112077648", "tenant": "stillness" },
                "kill_timestamp": "1773353433",
                "loss_type": { "@variant": "SHIP" },
                "solar_system_id": { "item_id": "30016295", "tenant": "stillness" }
              }
            }
          }
        }
      ],
      "pageInfo": { "hasNextPage": true, "endCursor": "..." }
    }
  }
}
```

---

## A7. Get Killmail Registry Object

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0x7fd9a32d0bbe7b1cfbb7140b1dd4312f54897de946c399edb21c3a12e52ce283",
      "version": 796327119,
      "digest": "7xG823VZwAY1LqnHVcHz1zSAiafPG9Ef4TYQpqLkwX67",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::killmail_registry::KillmailRegistry"
          },
          "json": {
            "id": "0x7fd9a32d0bbe7b1cfbb7140b1dd4312f54897de946c399edb21c3a12e52ce283"
          }
        },
        "dynamicFields": {
          "nodes": [
            {
              "name": {
                "json": { "pos0": "0x1874896041b698a525283b32bbef85715261be3717d759e546865bb25f1d6798" },
                "type": { "repr": "0x2::derived_object::Claimed" }
              },
              "value": { "json": { "@variant": "Reserved" } }
            }
          ]
        }
      }
    }
  }
}
```

> Note: Dynamic fields are `Claimed` sentinel entries — the actual killmail objects are separate objects referenced by the registry, not stored inline.

---

## A8. Get Location Registry Object

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0xc87dca9c6b2c95e4a0cbe1f8f9eeff50171123f176fbfdc7b49eef4824fc596b",
      "version": 796017334,
      "digest": "5mxahRvzrS8VakugG7XRsDYKgZdyqDbRWQKzvV4yo6y5",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::location::LocationRegistry"
          },
          "json": {
            "id": "0xc87dca9c6b2c95e4a0cbe1f8f9eeff50171123f176fbfdc7b49eef4824fc596b",
            "locations": {
              "id": "0x05da4731ca5899eb62f493725aff4ab94b3b4f018b0f832bbb2590150b129c3f",
              "size": "12"
            }
          }
        },
        "dynamicFields": { "nodes": [] }
      }
    }
  }
}
```

> Note: `locations` is a Move `Table` with 12 entries. Dynamic fields are empty here — the table contents live at the inner `id`.

---

## A9. Get Object Registry

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0x454a9aa3d37e1d08d3c9181239c1b683781e4087fbbbd48c935d54b6736fd05c",
      "version": 796479087,
      "digest": "BZUUWqATiUk2dXMjhRi8Q2yQ1Y73ZwYu1zwsHEUtM7mF",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::object_registry::ObjectRegistry"
          },
          "json": {
            "id": "0x454a9aa3d37e1d08d3c9181239c1b683781e4087fbbbd48c935d54b6736fd05c"
          }
        },
        "dynamicFields": {
          "nodes": [
            {
              "name": {
                "json": { "pos0": "0x31d19058a5559f76091886c2b59c1252bb81736ded99807cf4b97b60cddb8dcd" },
                "type": { "repr": "0x2::derived_object::Claimed" }
              },
              "value": { "json": { "@variant": "Reserved" } }
            }
          ]
        }
      }
    }
  }
}
```

---

## A10. Get Server Address Registry

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0xeb97b81668699672b1147c28dacb3d595534c48f4e177d3d80337dbde464f05f",
      "version": 791126224,
      "digest": "8fjKNnrvynh2nuAjXhzJfc4jUwYqRFKLyHQENUCxiSe3",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::access::ServerAddressRegistry"
          },
          "json": {
            "id": "0xeb97b81668699672b1147c28dacb3d595534c48f4e177d3d80337dbde464f05f",
            "authorized_address": {
              "id": "0x5a2ed588e9cfd6d8cf4c7e7340c0e936b685e649e6b4b9d090fcd7f9b514a72e",
              "size": "1"
            }
          }
        },
        "dynamicFields": { "nodes": [] }
      }
    }
  }
}
```

---

## A11. Get Energy Config

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0xd77693d0df5656d68b1b833e2a23cc81eb3875d8d767e7bd249adde82bdbc952",
      "version": 791126250,
      "digest": "EJtWtjQ6zs4QxTJdtQjdssQgbc9JW8Rx5M6NCiiQWMtN",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::energy::EnergyConfig"
          },
          "json": {
            "id": "0xd77693d0df5656d68b1b833e2a23cc81eb3875d8d767e7bd249adde82bdbc952",
            "assembly_energy": {
              "id": "0xbce57df68ceb56187f0e1d01414c211b0647d8c6fe48b3818432f209ea015eef",
              "size": "19"
            }
          }
        },
        "dynamicFields": { "nodes": [] }
      }
    }
  }
}
```

> Note: `assembly_energy` is a Move `Table` with 19 entries (one per assembly type with energy config).

---

## A12. Get Fuel Config

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0x4fcf28a9be750d242bc5d2f324429e31176faecb5b84f0af7dff3a2a6e243550",
      "version": 791126231,
      "digest": "4PyfwScehAXCRRfJMYL38iKG4FPBxqcq83bfvEjokNmm",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::fuel::FuelConfig"
          },
          "json": {
            "id": "0x4fcf28a9be750d242bc5d2f324429e31176faecb5b84f0af7dff3a2a6e243550",
            "fuel_efficiency": {
              "id": "0xbde50b263bce57786dfb5173db12ce3917f056584149f9e22153611bac1ffbcc",
              "size": "6"
            }
          }
        },
        "dynamicFields": { "nodes": [] }
      }
    }
  }
}
```

---

## A13. Get Gate Config

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "object": {
      "address": "0xd6d9230faec0230c839a534843396e97f5f79bdbd884d6d5103d0125dc135827",
      "version": 791126252,
      "digest": "DM2AknTdSoa5e3XPdQpMWByouVUoV6ewnZ4bnYqJJN19",
      "asMoveObject": {
        "contents": {
          "type": {
            "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::gate::GateConfig"
          },
          "json": {
            "id": "0xd6d9230faec0230c839a534843396e97f5f79bdbd884d6d5103d0125dc135827",
            "max_distance_by_type": {
              "id": "0xcdeee1d1ee5e90f311e2fbd94dd0cd7224eef215e1ff690f2982d7cf58fc4f7f",
              "size": "2"
            }
          }
        },
        "dynamicFields": { "nodes": [] }
      }
    }
  }
}
```

---

## A14. Get Events by Module — killmail

**Status:** ✅ Success

**Sample Response (3 events):**
```json
{
  "data": {
    "events": {
      "nodes": [
        {
          "contents": {
            "json": {
              "key": { "item_id": "252", "tenant": "stillness" },
              "killer_id": { "item_id": "2112077749", "tenant": "stillness" },
              "victim_id": { "item_id": "2112077944", "tenant": "stillness" },
              "reported_by_character_id": { "item_id": "2112077749", "tenant": "stillness" },
              "loss_type": { "@variant": "STRUCTURE" },
              "kill_timestamp": "1773340896",
              "solar_system_id": { "item_id": "30013496", "tenant": "stillness" }
            },
            "type": {
              "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::killmail::KillmailCreatedEvent"
            }
          },
          "timestamp": "2026-03-12T18:56:26.699Z"
        },
        {
          "contents": {
            "json": {
              "key": { "item_id": "264", "tenant": "stillness" },
              "killer_id": { "item_id": "2112077749", "tenant": "stillness" },
              "victim_id": { "item_id": "2112077944", "tenant": "stillness" },
              "loss_type": { "@variant": "STRUCTURE" },
              "kill_timestamp": "1773342736",
              "solar_system_id": { "item_id": "30013496", "tenant": "stillness" }
            },
            "type": {
              "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::killmail::KillmailCreatedEvent"
            }
          },
          "timestamp": "2026-03-12T19:13:23.318Z"
        }
      ],
      "pageInfo": { "hasNextPage": true, "endCursor": "..." }
    }
  }
}
```

## A14b. Get Events by Module — smart_character

**Status:** ✅ Success (empty result)

```json
{
  "data": {
    "events": {
      "nodes": [],
      "pageInfo": { "hasNextPage": false, "endCursor": null }
    }
  }
}
```

> Note: No events under `smart_character` module — character events are emitted from the `character` module instead.

---

## A15. Get Owned Objects filtered by EVE package type

**Status:** ✅ Success

**Sample Response:**
```json
{
  "data": {
    "objects": {
      "nodes": [
        {
          "address": "0xe666ac815f64c1dda8389c51444d8b33ff7e8a2364aefe4d373edb757a5b5593",
          "version": 792357393,
          "asMoveObject": {
            "contents": {
              "json": {
                "id": "0xe666ac815f64c1dda8389c51444d8b33ff7e8a2364aefe4d373edb757a5b5593",
                "character_id": "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a"
              },
              "type": {
                "repr": "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::character::PlayerProfile"
              }
            }
          }
        }
      ],
      "pageInfo": { "hasNextPage": false, "endCursor": "..." }
    }
  }
}
```

> Note: Filtering by package ID (not full `package::module::Type`) returns all objects owned by that wallet whose type belongs to the package. Same result as A2 since the wallet only owns a `PlayerProfile`.

---

## B. World REST API (Stillness)

Base URL: `https://world-api-stillness.live.tech.evefrontier.com`

---

## B1. GET /health

**Status:** ✅ Success

```json
{ "ok": true }
```

---

## B2. GET /config

**Status:** ✅ Success

```json
[
  {
    "podPublicSigningKey": "4MbZYmZ1n1+qGH8sQjHr4jAeT8rk6MHo5RU2OXQHGS4"
  }
]
```

---

## B3. GET /v2/types/{id} — Jotunn's item type (2112077867)

**Status:** ❌ Error: `{ "message": "type not found" }`

> Note: Character item IDs (e.g. `2112077867`) are not in the types database. The `/v2/types` endpoint covers game item types (ships, modules, commodities), not character assembly IDs.

---

## B4. GET /v2/types — list

**Status:** ✅ Success

```json
{
  "data": [
    {
      "id": 72244,
      "name": "Feral Data",
      "description": "",
      "mass": 0.10000000149011612,
      "radius": 1,
      "volume": 0.10000000149011612,
      "portionSize": 1,
      "groupName": "Rogue Drone Analysis Data",
      "groupId": 0,
      "categoryName": "Commodity",
      "categoryId": 17,
      "iconUrl": ""
    },
    {
      "id": 72960,
      "name": "Hull Repairer",
      "description": "",
      "mass": 1000,
      "radius": 1,
      "volume": 12.5,
      "portionSize": 1,
      "groupName": "Hull Repair Unit",
      "groupId": 0,
      "categoryName": "Module",
      "categoryId": 7,
      "iconUrl": ""
    },
    {
      "id": 73192,
      "name": "Ophidian Sensor Cloak",
      "description": "",
      "mass": 0,
      "radius": 0,
      "volume": 1,
      "portionSize": 0,
      "groupName": "License",
      "groupId": 0,
      "categoryName": "Commodity",
      "categoryId": 17,
      "iconUrl": ""
    }
  ],
  "metadata": {
    "total": 390,
    "limit": 5,
    "offset": 0
  }
}
```

---

## B5. GET /v2/tribes/{id} — Jotunn's tribe (98000430)

**Status:** ✅ Success

```json
{
  "id": 98000430,
  "name": "WARTIME RELOADED",
  "nameShort": "WAAAR",
  "description": "The official tribal designation of the Wartime Republic of War.",
  "taxRate": 0,
  "tribeUrl": ""
}
```

---

## B6. GET /v2/tribes — list

**Status:** ✅ Success

```json
{
  "data": [
    {
      "id": 98000418,
      "name": "Pegasus Cartel",
      "nameShort": "PGCL",
      "description": "",
      "taxRate": 0,
      "tribeUrl": ""
    },
    {
      "id": 98000420,
      "name": "Game Masters",
      "nameShort": "GMS",
      "description": "EVE Frontier Game Masters live here",
      "taxRate": 0,
      "tribeUrl": "https://support.evefrontier.com"
    },
    {
      "id": 98000421,
      "name": "ExoTech Industrial",
      "nameShort": "EXTI",
      "description": "",
      "taxRate": 0,
      "tribeUrl": ""
    },
    {
      "id": 98000422,
      "name": "SILVER",
      "nameShort": "SLV",
      "description": "",
      "taxRate": 0,
      "tribeUrl": "https://www.silver-tribe.com"
    },
    {
      "id": 98000423,
      "name": "PEACEFUL TRADE EMPIRE",
      "nameShort": "PEACE",
      "description": "",
      "taxRate": 0,
      "tribeUrl": ""
    }
  ],
  "metadata": {
    "total": 6,
    "limit": 5,
    "offset": 0
  }
}
```

---

## B7. GET /v2/ships — list

**Status:** ✅ Success

```json
{
  "data": [
    { "id": 81609, "name": "USV", "classId": 25, "className": "Frigate", "description": "A light vessel optimized for resource extraction (placeholder)." },
    { "id": 81611, "name": "Chumaq", "classId": 419, "className": "Combat Battlecruiser", "description": "A large hauler with extensive cargo capacity. (placeholder)" },
    { "id": 81808, "name": "TADES", "classId": 420, "className": "Destroyer", "description": "A medium-sized and flexible combat vessel. (placeholder)" },
    { "id": 81904, "name": "MCF", "classId": 25, "className": "Frigate", "description": "A lightweight combat vessel designed focused on evading fire. (placeholder)" },
    { "id": 82424, "name": "HAF", "classId": 25, "className": "Frigate", "description": "A small but durable combat vessel. (placeholder)" }
  ],
  "metadata": { "total": 11, "limit": 5, "offset": 0 }
}
```

---

## B8. GET /v2/ships/{id} — ship 81609 (USV/Frigate)

**Status:** ✅ Success

```json
{
  "id": 81609,
  "name": "USV",
  "classId": 25,
  "className": "Frigate",
  "description": "A light vessel optimized for resource extraction (placeholder).",
  "slots": { "high": 2, "medium": 3, "low": 4 },
  "health": { "shield": 0, "armor": 0, "structure": 2160 },
  "physics": {
    "mass": 30266600,
    "maximumVelocity": 280,
    "inertiaModifier": 0.2,
    "heat": { "heatCapacity": 1.8, "conductance": 0.55 }
  },
  "damageResistances": {
    "shield": { "emDamage": 0, "thermalDamage": 0, "kineticDamage": 0, "explosiveDamage": 0 },
    "armor": { "emDamage": 0, "thermalDamage": 0, "kineticDamage": 0, "explosiveDamage": 0 },
    "structure": { "emDamage": 0, "thermalDamage": 0, "kineticDamage": 0, "explosiveDamage": 0 }
  },
  "fuelCapacity": 2420,
  "cpuOutput": 30,
  "powergridOutput": 110,
  "capacitor": { "capacity": 45, "rechargeRate": 0 }
}
```

---

## B9. GET /v2/solarsystems — list

**Status:** ✅ Success

```json
{
  "data": [
    {
      "id": 30000001,
      "name": "A 2560",
      "constellationId": 20000001,
      "regionId": 10000001,
      "location": {
        "x": -5103797186450162000,
        "y": -442889159183433700,
        "z": 1335601100954271700
      }
    },
    {
      "id": 30000002,
      "name": "M 974",
      "constellationId": 20000002,
      "regionId": 10000002,
      "location": {
        "x": -11002921710805582000,
        "y": -174975576069636100,
        "z": -6580585888332382000
      }
    },
    {
      "id": 30000003,
      "name": "U 3183",
      "constellationId": 20000003,
      "regionId": 10000003,
      "location": {
        "x": -17415653955018424000,
        "y": -684175370991173600,
        "z": -2373760117339324400
      }
    }
  ],
  "metadata": { "total": 24502, "limit": 3, "offset": 0 }
}
```

---

## B10. GET /v2/solarsystems/{id} — system 30000001 (A 2560)

**Status:** ✅ Success

```json
{
  "id": 30000001,
  "name": "A 2560",
  "constellationId": 20000001,
  "regionId": 10000001,
  "location": {
    "x": -5103797186450162000,
    "y": -442889159183433700,
    "z": 1335601100954271700
  },
  "gateLinks": []
}
```

---

## B11. GET /v2/constellations — list

**Status:** ✅ Success

```json
{
  "data": [
    {
      "id": 20000001,
      "name": "20000001",
      "regionId": 10000001,
      "location": { "x": -3349382073432408000, "y": -510283621328748540, "z": 396384765130833900 },
      "solarSystems": [
        {
          "id": 30000001,
          "name": "A 2560",
          "constellationId": 20000001,
          "regionId": 10000001,
          "location": { "x": -5103797186450162000, "y": -442889159183433700, "z": 1335601100954271700 }
        }
      ]
    },
    {
      "id": 20000002,
      "name": "20000002",
      "regionId": 10000002,
      "location": { "x": -10981875958738321000, "y": 491264956386246660, "z": -7290096893445538000 },
      "solarSystems": [
        {
          "id": 30000002,
          "name": "M 974",
          "constellationId": 20000002,
          "regionId": 10000002,
          "location": { "x": -11002921710805582000, "y": -174975576069636100, "z": -6580585888332382000 }
        }
      ]
    }
  ],
  "metadata": { "total": 24502, "limit": 3, "offset": 0 }
}
```

---

## B12. GET /v2/constellations/{id} — constellation 20000001

**Status:** ✅ Success

```json
{
  "id": 20000001,
  "name": "20000001",
  "regionId": 10000001,
  "location": { "x": -3349382073432408000, "y": -510283621328748540, "z": 396384765130833900 },
  "solarSystems": [
    {
      "id": 30000001,
      "name": "A 2560",
      "constellationId": 20000001,
      "regionId": 10000001,
      "location": { "x": -5103797186450162000, "y": -442889159183433700, "z": 1335601100954271700 }
    }
  ]
}
```

---

## B13. POST /v2/pod/verify

**Status:** ✅ Responded (validation error — expected)

```json
{ "isValid": false, "error": "invalid POD json" }
```

> Note: The endpoint accepts POD (Proof of Data) verification payloads. The `payload` field must be a valid signed POD JSON string, not a plain string. The endpoint correctly rejects invalid input.

---

## B14. GET /v2/characters/me/jumps (no auth)

**Status:** ❌ 401 Unauthorized — expected

**HTTP Status:** `401`

```json
{ "message": "missing authorization header" }
```

> Note: This endpoint requires a `Authorization: Bearer <token>` header with a valid EVE Frontier session token. The JWT must be obtained via the POD verification flow (`/v2/pod/verify`).

---

## Summary

| Endpoint | Status |
|----------|--------|
| A1. Get Character Object | ✅ Success |
| A2. Get Owned Objects by Wallet | ✅ Success |
| A3. Get Transactions for Wallet | ✅ Success |
| A4. Get Transaction Events for Character | ✅ Success |
| A5. Get Object Version History | ✅ Success |
| A6. Get All Killmail Objects (by type) | ✅ Success |
| A7. Get Killmail Registry Object | ✅ Success |
| A8. Get Location Registry Object | ✅ Success |
| A9. Get Object Registry | ✅ Success |
| A10. Get Server Address Registry | ✅ Success |
| A11. Get Energy Config | ✅ Success |
| A12. Get Fuel Config | ✅ Success |
| A13. Get Gate Config | ✅ Success |
| A14. Get Events by Module (killmail) | ✅ Success |
| A14b. Get Events by Module (smart_character) | ✅ Success (empty) |
| A15. Get Owned Objects by Package Type | ✅ Success |
| B1. GET /health | ✅ Success |
| B2. GET /config | ✅ Success |
| B3. GET /v2/types/{id} (char item ID) | ❌ 404 Not Found |
| B4. GET /v2/types | ✅ Success |
| B5. GET /v2/tribes/{id} | ✅ Success |
| B6. GET /v2/tribes | ✅ Success |
| B7. GET /v2/ships | ✅ Success |
| B8. GET /v2/ships/{id} | ✅ Success |
| B9. GET /v2/solarsystems | ✅ Success |
| B10. GET /v2/solarsystems/{id} | ✅ Success |
| B11. GET /v2/constellations | ✅ Success |
| B12. GET /v2/constellations/{id} | ✅ Success |
| B13. POST /v2/pod/verify | ✅ Responded (invalid input error) |
| B14. GET /v2/characters/me/jumps | ❌ 401 Unauthorized (expected) |
