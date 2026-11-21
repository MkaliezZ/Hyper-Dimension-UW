import {CHEMICAL_CONSTRUCTION} from './campus-chemical-construction-data-v1.js';
import {REVIEWED_CANOPY_SITES} from './campus-canopy-sites-v1.js';
import {FOSTER_SITE} from './campus-foster-site-data-v4.js';
// Registered Guggenheim Annex exterior approach. Preserve timber-side collision.
export const BUILDING_ACCESS={
  "schema": "uw.building-access/v1",
  "geometryHash": "e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d",
  "buildings": [
    {"id": "sea-76205-0", "code": "HLL", "placement": {"x": 285.8446035385132, "z": 2.4969348907470703, "angle": 0, "groundY": 22.451187}, "rails": [], "surfaces": [], "outdoorArrival": {"pathId": "uw-35-437-256", "point": [263.317, -1.8488000000000002]}, "approach": {"source": "UW sidewalk line and publicly documented west entry", "interval": "Stevens Way outdoor path"}},
    {"id": "sea-77732-0", "placement": {"x": 279.3603630065918, "z": -86.71079444885254, "angle": 0, "groundY": 23.64988885429898}, "rails": [], "surfaces": [], "outdoorArrival": {"pathId": "uw-35-424-245", "point": [268.1522403550168, -103.59413930404628]}, "approach": {"source": "UW walking map and C-wing exterior survey returns", "interval": "Outdoor C-wing landing"}},
    {"id":"sea-90463-0","outdoorArrival":{"pathId":"uw-35-212-136","point":[276.9178870715247,-230.13977473526936]},"provenance":"Documented Whitman Court exterior bridge landing","placement":{"x":310.8056600161173,"z":-224.41754444481234,"groundY":24.716299057006836,"angle":0.027592995009394362},"rails":[],"surfaces":[]},
    {
      "id": "sea-26867-0",
      "code": "ICH",
      "source": "/art-v0130/models/cunningham-q-v1/near-entry-v7.glb",
      "sourceSha256": "a45a0608421d6b62dbfd0a54f0b51a572ef0e7ec6b2648f17c789b9c608c7fa2",
      "placement": {
        "x": -238.25910054503933,
        "z": -109.56705742751859,
        "width": 25.835587353351144,
        "depth": 13.303184603467571,
        "angle": -0.01050467053589427,
        "sourceQuarter": 0,
        "height": 9.6,
        "groundY": 35.03
      },
      "surfaces": [
        {
          "id": "front-flight",
          "kind": "stairs",
          "x": [
            -1.68,
            1.68
          ],
          "z": [
            6.1,
            10.5
          ],
          "axis": "z",
          "highAt": "min",
          "top": 0.844,
          "bottom": -0.17132301514066398,
          "count": 14
        },
        {
          "id": "front-landing",
          "kind": "flat",
          "x": [
            -1.86,
            1.86
          ],
          "z": [
            5.72,
            6.12
          ],
          "height": 0.844
        },
        {
          "id": "upper-flight",
          "kind": "stairs",
          "x": [
            13,
            14.04
          ],
          "z": [
            -5.02,
            2.82
          ],
          "axis": "z",
          "highAt": "min",
          "top": 4.52,
          "bottom": 1.111072867352612,
          "count": 22
        },
        {
          "id": "upper-landing",
          "kind": "flat",
          "x": [
            12.82,
            14.06
          ],
          "z": [
            -6.3,
            -5
          ],
          "height": 4.52
        },
        {
          "id": "rear-approach",
          "kind": "ramp",
          "x": [
            -12.45,
            -4
          ],
          "z": [
            -7.99,
            -6.69
          ],
          "axis": "x",
          "startHeight": 0.8503585468447793,
          "endHeight": 1.25
        },
        {
          "id": "front-porch",
          "kind": "flat",
          "x": [
            -1.3,
            1.3
          ],
          "z": [
            4.6,
            5.74
          ],
          "height": 0.844
        }
      ],
      "rails": [
        {
          "a": [
            -1.55,
            6.13
          ],
          "b": [
            -1.55,
            10.43
          ],
          "radius": 0.026
        },
        {
          "a": [
            0,
            6.13
          ],
          "b": [
            0,
            10.43
          ],
          "radius": 0.026
        },
        {
          "a": [
            1.55,
            6.13
          ],
          "b": [
            1.55,
            10.43
          ],
          "radius": 0.026
        },
        {
          "a": [
            13.04,
            -5.04
          ],
          "b": [
            13.04,
            2.82
          ],
          "radius": 0.026
        },
        {
          "a": [
            13.04,
            -6.25
          ],
          "b": [
            13.04,
            -5.05
          ],
          "radius": 0.026
        },
        {
          "a": [
            14,
            -5.04
          ],
          "b": [
            14,
            2.82
          ],
          "radius": 0.026
        },
        {
          "a": [
            14,
            -6.25
          ],
          "b": [
            14,
            -5.05
          ],
          "radius": 0.026
        },
        {
          "a": [
            13.04,
            -6.25
          ],
          "b": [
            14,
            -6.25
          ],
          "radius": 0.026
        },
        {
          "a": [
            -12.45,
            -7.94
          ],
          "b": [
            -4,
            -7.94
          ],
          "radius": 0.025
        }
      ],
      "openFootprintCorridors": [
        {
          "id": "front-open-porch",
          "x": [
            -1.3,
            1.3
          ],
          "z": [
            4.6,
            7.1
          ]
        }
      ]
    },
    {
      "id": "sea-47588-0",
      "code": "CMU",
      "portalId": "cmu-tho-portal-0",
      "label": "Thomson SW entrance 13",
      "source": "/art-v0130/models/communications-thomson-complete-q-v2/near-architecture-v30.glb",
      "sourceSha256": "baec1a8f89363a7c2096420f085e64fd2f561f8cb9ac83e2b641ce5c502a16c1",
      "placement": {
        "x": 136.565390787262,
        "z": -43.87553065037354,
        "width": 1,
        "depth": 1,
        "height": 1,
        "angle": -0.7794656647526753,
        "sourceQuarter": 0,
        "groundY": 36.63
      },
      "surfaces": [
        {
          "id": "stone-threshold",
          "kind": "flat",
          "x": [
            -1.42,
            1.42
          ],
          "z": [
            0.37,
            1.105
          ],
          "height": -1.529674924122871
        },
        {
          "id": "tread-0",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            2.02,
            2.345
          ],
          "height": -2.122259896832827
        },
        {
          "id": "tread-1",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            1.71,
            2.035
          ],
          "height": -1.9741136536553379
        },
        {
          "id": "tread-2",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            1.4,
            1.7249999999999999
          ],
          "height": -1.825967410477849
        },
        {
          "id": "tread-3",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            1.09,
            1.415
          ],
          "height": -1.67782116730036
        },
        {
          "id": "tread-4",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            0.78,
            1.105
          ],
          "height": -1.529674924122871
        }
      ],
      "rails": [
        {
          "id": "closed-door",
          "a": [
            -1.24,
            0.7
          ],
          "b": [
            1.24,
            0.7
          ],
          "radius": 0.02
        },
        {
          "id": "portal-jamb--1",
          "a": [
            -1.34,
            0.4
          ],
          "b": [
            -1.34,
            0.78
          ],
          "radius": 0.04
        },
        {
          "id": "portal-jamb-1",
          "a": [
            1.34,
            0.4
          ],
          "b": [
            1.34,
            0.78
          ],
          "radius": 0.04
        }
      ],
      "openFootprintCorridors": [
        {
          "x": [
            -0.8,
            0.8
          ],
          "z": [
            1.1199999999999999,
            3.63
          ],
          "verification": "Requires all points and visitor-radius disk outside actual official body footprints; only historical canonical outline overlap is opened"
        }
      ],
      "approach": {
        "local": [
          0,
          3.1799999999999997
        ],
        "target": [
          0,
          1.17
        ]
      },
      "geometrySourceFeature": {
        "kind": "source-thomson-filled-sculpted-portal",
        "label": "Thomson SW entrance 13",
        "a": [
          -38.97385829302343,
          -3.931697107879369
        ],
        "e": [
          0.00013665316427912533,
          0.9999999906629563
        ],
        "n": [
          -0.9999999906629563,
          0.00013665316427912533
        ],
        "center": 2.33390089235718,
        "base": -1.529674924122871,
        "frontDepth": 0.78,
        "woodBronzeMaterial": 10,
        "narrowUpperWindowWidth": 1.3,
        "clearWidth": 2.48,
        "doorDepth": 0.7,
        "landing": {
          "x": [
            -1.42,
            1.42
          ],
          "z": [
            0.37,
            1.105
          ],
          "height": -1.529674924122871
        },
        "continuousThresholdBridge": true,
        "stairFootY": -2.2704061400103157,
        "stairCount": 5,
        "stairTread": 0.31,
        "stairWidth": 3.8,
        "source": "CMU-THO-eventservices-thomson-v1.jpg",
        "sourcePhotoPage1139": true,
        "exactSillUnverified": true
      },
      "modelSillSurveyed": false
    },
    {
      "id": "sea-47588-0",
      "code": "CMU",
      "portalId": "cmu-tho-portal-1",
      "label": "Thomson SW entrance 21",
      "source": "/art-v0130/models/communications-thomson-complete-q-v2/near-architecture-v30.glb",
      "sourceSha256": "baec1a8f89363a7c2096420f085e64fd2f561f8cb9ac83e2b641ce5c502a16c1",
      "placement": {
        "x": 160.14636702946154,
        "z": -21.080870788544406,
        "width": 1,
        "depth": 1,
        "height": 1,
        "angle": -0.7579691865780676,
        "sourceQuarter": 0,
        "groundY": 36.63
      },
      "surfaces": [
        {
          "id": "stone-threshold",
          "kind": "flat",
          "x": [
            -1.42,
            1.42
          ],
          "z": [
            0.37,
            1.105
          ],
          "height": -1.5140655878044798
        },
        {
          "id": "tread-0",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            1.71,
            2.035
          ],
          "height": -2.047510514796494
        },
        {
          "id": "tread-1",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            1.4,
            1.7249999999999999
          ],
          "height": -1.8696955391324892
        },
        {
          "id": "tread-2",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            1.09,
            1.415
          ],
          "height": -1.6918805634684846
        },
        {
          "id": "tread-3",
          "kind": "flat",
          "x": [
            -1.9,
            1.9
          ],
          "z": [
            0.78,
            1.105
          ],
          "height": -1.5140655878044798
        }
      ],
      "rails": [
        {
          "id": "closed-door",
          "a": [
            -1.24,
            0.7
          ],
          "b": [
            1.24,
            0.7
          ],
          "radius": 0.02
        },
        {
          "id": "portal-jamb--1",
          "a": [
            -1.34,
            0.4
          ],
          "b": [
            -1.34,
            0.78
          ],
          "radius": 0.04
        },
        {
          "id": "portal-jamb-1",
          "a": [
            1.34,
            0.4
          ],
          "b": [
            1.34,
            0.78
          ],
          "radius": 0.04
        }
      ],
      "openFootprintCorridors": [
        {
          "x": [
            -0.8,
            0.8
          ],
          "z": [
            1.1199999999999999,
            3.3200000000000003
          ],
          "verification": "Requires all points and visitor-radius disk outside actual official body footprints; only historical canonical outline overlap is opened"
        }
      ],
      "approach": {
        "local": [
          0,
          2.87
        ],
        "target": [
          0,
          1.17
        ]
      },
      "geometrySourceFeature": {
        "kind": "source-thomson-filled-sculpted-portal",
        "label": "Thomson SW entrance 21",
        "a": [
          -38.64234307109514,
          29.59156703463996
        ],
        "e": [
          0.021631444022055402,
          0.9997660129397881
        ],
        "n": [
          -0.9997660129397881,
          0.021631444022055402
        ],
        "center": 1.6062110807320258,
        "base": -1.5140655878044798,
        "frontDepth": 0.78,
        "woodBronzeMaterial": 10,
        "narrowUpperWindowWidth": 1.3,
        "clearWidth": 2.48,
        "doorDepth": 0.7,
        "landing": {
          "x": [
            -1.42,
            1.42
          ],
          "z": [
            0.37,
            1.105
          ],
          "height": -1.5140655878044798
        },
        "continuousThresholdBridge": true,
        "stairFootY": -2.2253254904604987,
        "stairCount": 4,
        "stairTread": 0.31,
        "stairWidth": 3.8,
        "source": "CMU-THO-eventservices-thomson-v1.jpg",
        "sourcePhotoPage1139": true,
        "exactSillUnverified": true
      },
      "modelSillSurveyed": false
    },
    {
      "id": "sea-47588-0",
      "code": "CMU",
      "portalId": "cmu-tho-portal-2",
      "label": "Communications east paired portal A",
      "source": "/art-v0130/models/communications-thomson-complete-q-v2/near-architecture-v30.glb",
      "sourceSha256": "baec1a8f89363a7c2096420f085e64fd2f561f8cb9ac83e2b641ce5c502a16c1",
      "placement": {
        "x": 220.5380031046719,
        "z": -94.77915117436106,
        "width": 1,
        "depth": 1,
        "height": 1,
        "angle": 0.7919253229525005,
        "sourceQuarter": 0,
        "groundY": 36.63
      },
      "surfaces": [
        {
          "id": "stone-threshold",
          "kind": "flat",
          "x": [
            -1.095,
            1.095
          ],
          "z": [
            0.4,
            1.23
          ],
          "height": -0.4261172312180619
        },
        {
          "id": "tread-0",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            1.83,
            2.13
          ],
          "height": -0.8719659783505442
        },
        {
          "id": "tread-1",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            1.53,
            1.83
          ],
          "height": -0.7233497293063834
        },
        {
          "id": "tread-2",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            1.23,
            1.53
          ],
          "height": -0.5747334802622226
        },
        {
          "id": "tread-3",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            0.93,
            1.23
          ],
          "height": -0.4261172312180619
        }
      ],
      "rails": [
        {
          "id": "closed-door",
          "a": [
            -0.875,
            0.662
          ],
          "b": [
            0.875,
            0.662
          ],
          "radius": 0.02
        },
        {
          "id": "portal-jamb--1",
          "a": [
            -0.975,
            0.4
          ],
          "b": [
            -0.975,
            0.91
          ],
          "radius": 0.04
        },
        {
          "id": "portal-jamb-1",
          "a": [
            0.975,
            0.4
          ],
          "b": [
            0.975,
            0.91
          ],
          "radius": 0.04
        }
      ],
      "openFootprintCorridors": [
        {
          "x": [
            -0.435,
            0.435
          ],
          "z": [
            1.082,
            3.4299999999999997
          ],
          "verification": "Requires all points and visitor-radius disk outside actual official body footprints; only historical canonical outline overlap is opened"
        }
      ],
      "approach": {
        "local": [
          0,
          2.9799999999999995
        ],
        "target": [
          0,
          1.1320000000000001
        ]
      },
      "geometrySourceFeature": {
        "kind": "source-correlated-arched-entry-trial",
        "label": "Communications east paired portal A",
        "a": [
          53.86384157411955,
          22.339630304110212
        ],
        "e": [
          0.9999997325898737,
          -0.0007313140097967673
        ],
        "n": [
          0.0007313140097967673,
          0.9999997325898737
        ],
        "center": 2.3973914351421928,
        "base": -0.4261172312180619,
        "width": 1.75,
        "frontDepth": 0.91,
        "doorDepth": 0.662,
        "stepFront": 0.93,
        "tread": 0.3,
        "stepCount": 4,
        "groundAtFoot": -1.020582227394705,
        "landing": {
          "x": [
            -1.095,
            1.095
          ],
          "z": [
            0.4,
            1.23
          ],
          "height": -0.4261172312180619
        },
        "stairsBeyondDoorAndJambs": true,
        "sourcePhotoPages": [
          358,
          1139
        ],
        "exactSillUnverified": true
      },
      "modelSillSurveyed": false
    },
    {
      "id": "sea-47588-0",
      "code": "CMU",
      "portalId": "cmu-tho-portal-3",
      "label": "Communications east paired portal B",
      "source": "/art-v0130/models/communications-thomson-complete-q-v2/near-architecture-v30.glb",
      "sourceSha256": "baec1a8f89363a7c2096420f085e64fd2f561f8cb9ac83e2b641ce5c502a16c1",
      "placement": {
        "x": 222.29419398593896,
        "z": -96.55841888568347,
        "width": 1,
        "depth": 1,
        "height": 1,
        "angle": 0.7919253229525005,
        "sourceQuarter": 0,
        "groundY": 36.63
      },
      "surfaces": [
        {
          "id": "stone-threshold",
          "kind": "flat",
          "x": [
            -1.095,
            1.095
          ],
          "z": [
            0.4,
            1.23
          ],
          "height": -0.4261172312180619
        },
        {
          "id": "tread-0",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            1.83,
            2.13
          ],
          "height": -0.8809065413176704
        },
        {
          "id": "tread-1",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            1.53,
            1.83
          ],
          "height": -0.7293101046178009
        },
        {
          "id": "tread-2",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            1.23,
            1.53
          ],
          "height": -0.5777136679179313
        },
        {
          "id": "tread-3",
          "kind": "flat",
          "x": [
            -1.525,
            1.525
          ],
          "z": [
            0.93,
            1.23
          ],
          "height": -0.4261172312180619
        }
      ],
      "rails": [
        {
          "id": "closed-door",
          "a": [
            -0.875,
            0.662
          ],
          "b": [
            0.875,
            0.662
          ],
          "radius": 0.02
        },
        {
          "id": "portal-jamb--1",
          "a": [
            -0.975,
            0.4
          ],
          "b": [
            -0.975,
            0.91
          ],
          "radius": 0.04
        },
        {
          "id": "portal-jamb-1",
          "a": [
            0.975,
            0.4
          ],
          "b": [
            0.975,
            0.91
          ],
          "radius": 0.04
        }
      ],
      "openFootprintCorridors": [
        {
          "x": [
            -0.435,
            0.435
          ],
          "z": [
            1.082,
            3.4299999999999997
          ],
          "verification": "Requires all points and visitor-radius disk outside actual official body footprints; only historical canonical outline overlap is opened"
        }
      ],
      "approach": {
        "local": [
          0,
          2.9799999999999995
        ],
        "target": [
          0,
          1.1320000000000001
        ]
      },
      "geometrySourceFeature": {
        "kind": "source-correlated-arched-entry-trial",
        "label": "Communications east paired portal B",
        "a": [
          53.86384157411955,
          22.339630304110212
        ],
        "e": [
          0.9999997325898737,
          -0.0007313140097967673
        ],
        "n": [
          0.0007313140097967673,
          0.9999997325898737
        ],
        "center": 4.897391435142193,
        "base": -0.4261172312180619,
        "width": 1.75,
        "frontDepth": 0.91,
        "doorDepth": 0.662,
        "stepFront": 0.93,
        "tread": 0.3,
        "stepCount": 4,
        "groundAtFoot": -1.0325029780175399,
        "landing": {
          "x": [
            -1.095,
            1.095
          ],
          "z": [
            0.4,
            1.23
          ],
          "height": -0.4261172312180619
        },
        "stairsBeyondDoorAndJambs": true,
        "sourcePhotoPages": [
          358,
          1139
        ],
        "exactSillUnverified": true
      },
      "modelSillSurveyed": false
    },
    {
      "id": "sea-47588-0",
      "code": "CMU",
      "portalId": "cmu-tho-portal-4",
      "label": "Communications main vaulted entrance",
      "source": "/art-v0130/models/communications-thomson-complete-q-v2/near-architecture-v30.glb",
      "sourceSha256": "baec1a8f89363a7c2096420f085e64fd2f561f8cb9ac83e2b641ce5c502a16c1",
      "placement": {
        "x": 186.00094202461335,
        "z": -101.03838279169955,
        "width": 1,
        "depth": 1,
        "height": 1,
        "angle": -2.3503986447122767,
        "sourceQuarter": 0,
        "groundY": 36.63
      },
      "surfaces": [
        {
          "id": "porch-floor",
          "kind": "flat",
          "x": [
            -1.33,
            1.33
          ],
          "z": [
            -0.03,
            1.9200000000000002
          ],
          "height": 0.5861174723860614
        },
        {
          "id": "tread-0",
          "kind": "flat",
          "x": [
            -1.94,
            1.94
          ],
          "z": [
            2.7199999999999998,
            3.025
          ],
          "height": 0.0669117740706639
        },
        {
          "id": "tread-1",
          "kind": "flat",
          "x": [
            -1.94,
            1.94
          ],
          "z": [
            2.43,
            2.7350000000000003
          ],
          "height": 0.2399803401757964
        },
        {
          "id": "tread-2",
          "kind": "flat",
          "x": [
            -1.94,
            1.94
          ],
          "z": [
            2.14,
            2.4450000000000003
          ],
          "height": 0.41304890628092883
        },
        {
          "id": "tread-3",
          "kind": "flat",
          "x": [
            -1.94,
            1.94
          ],
          "z": [
            1.85,
            2.1550000000000002
          ],
          "height": 0.5861174723860614
        }
      ],
      "rails": [
        {
          "id": "closed-door",
          "a": [
            -1.3,
            0.36
          ],
          "b": [
            1.3,
            0.36
          ],
          "radius": 0.02
        },
        {
          "id": "porch-jamb--1",
          "a": [
            -1.32,
            0.055
          ],
          "b": [
            -1.32,
            1.85
          ],
          "radius": 0.025
        },
        {
          "id": "stair-handrail--1",
          "a": [
            -1.81,
            1.9500000000000002
          ],
          "b": [
            -1.81,
            3.01
          ],
          "radius": 0.022
        },
        {
          "id": "porch-jamb-1",
          "a": [
            1.32,
            0.055
          ],
          "b": [
            1.32,
            1.85
          ],
          "radius": 0.025
        },
        {
          "id": "stair-handrail-1",
          "a": [
            1.81,
            1.9500000000000002
          ],
          "b": [
            1.81,
            3.01
          ],
          "radius": 0.022
        }
      ],
      "openFootprintCorridors": [
        {
          "x": [
            -0.8600000000000001,
            0.8600000000000001
          ],
          "z": [
            0.78,
            4.31
          ],
          "verification": "Requires all points and visitor-radius disk outside actual official body footprints; only historical canonical outline overlap is opened"
        }
      ],
      "approach": {
        "local": [
          0,
          3.8599999999999994
        ],
        "target": [
          0,
          0.85
        ]
      },
      "geometrySourceFeature": {
        "kind": "source-main-portal-with-physical-recess",
        "a": [
          35.128725,
          -6.611931
        ],
        "e": [
          0.9999508692323693,
          -0.009912573905364598
        ],
        "n": [
          0,
          -1
        ],
        "center": 1.3046560987556255,
        "base": 0.5861174723860614,
        "frontDepth": 1.85,
        "doorDepth": 0.19,
        "clearWidth": 2.6,
        "stairFootY": -0.1061567920344686,
        "stairCount": 4,
        "stairTread": 0.29,
        "stairWidth": 3.88,
        "spring": 3.066117472386061,
        "peak": 3.7861174723860618,
        "archStyle": "source low depressed pointed profile, not a steep triangle",
        "photographs": [
          "CMU-primary-campus-contact-v3.jpg",
          "CMU-primary-campus-programmes-v3.jpg",
          "CMU-THO-primary-cmu-front-v2.jpg"
        ],
        "surveyedDimensions": false
      },
      "modelSillSurveyed": false
    },
    {
      "id": "sea-47588-0",
      "code": "CMU",
      "portalId": "cmu-tho-portal-5",
      "label": "Communications southeast west-end entry",
      "source": "/art-v0130/models/communications-thomson-complete-q-v2/near-architecture-v30.glb",
      "sourceSha256": "baec1a8f89363a7c2096420f085e64fd2f561f8cb9ac83e2b641ce5c502a16c1",
      "placement": {
        "x": 177.05858611233998,
        "z": -64.87816130323336,
        "width": 1,
        "depth": 1,
        "height": 1,
        "angle": 0.7914026123168942,
        "sourceQuarter": 0,
        "groundY": 36.63
      },
      "surfaces": [
        {
          "id": "stone-threshold",
          "kind": "flat",
          "x": [
            -1.595,
            1.595
          ],
          "z": [
            0.4,
            1.23
          ],
          "height": -0.9318412055851895
        },
        {
          "id": "tread-0",
          "kind": "flat",
          "x": [
            -2.025,
            2.025
          ],
          "z": [
            1.53,
            1.83
          ],
          "height": -1.2768283341367483
        },
        {
          "id": "tread-1",
          "kind": "flat",
          "x": [
            -2.025,
            2.025
          ],
          "z": [
            1.23,
            1.53
          ],
          "height": -1.104334769860969
        },
        {
          "id": "tread-2",
          "kind": "flat",
          "x": [
            -2.025,
            2.025
          ],
          "z": [
            0.93,
            1.23
          ],
          "height": -0.9318412055851895
        }
      ],
      "rails": [
        {
          "id": "closed-door",
          "a": [
            -1.375,
            0.662
          ],
          "b": [
            1.375,
            0.662
          ],
          "radius": 0.02
        },
        {
          "id": "portal-jamb--1",
          "a": [
            -1.475,
            0.4
          ],
          "b": [
            -1.475,
            0.91
          ],
          "radius": 0.04
        },
        {
          "id": "portal-jamb-1",
          "a": [
            1.475,
            0.4
          ],
          "b": [
            1.475,
            0.91
          ],
          "radius": 0.04
        }
      ],
      "openFootprintCorridors": [
        {
          "x": [
            -0.935,
            0.935
          ],
          "z": [
            1.082,
            6.130000000000003
          ],
          "verification": "Requires all points and visitor-radius disk outside actual official body footprints; only historical canonical outline overlap is opened"
        }
      ],
      "approach": {
        "local": [
          0,
          5.680000000000002
        ],
        "target": [
          0,
          1.1320000000000001
        ]
      },
      "geometrySourceFeature": {
        "kind": "source-correlated-arched-entry-trial",
        "label": "Communications southeast west-end entry",
        "a": [
          2.576609590189924,
          12.43629515313511
        ],
        "e": [
          0.9999999782423027,
          -0.00020860343786451664
        ],
        "n": [
          0.00020860343786451664,
          0.9999999782423027
        ],
        "center": 1.8533589261936227,
        "base": -0.9318412055851895,
        "width": 2.75,
        "frontDepth": 0.91,
        "doorDepth": 0.662,
        "stepFront": 0.93,
        "tread": 0.3,
        "stepCount": 3,
        "groundAtFoot": -1.4493218984125278,
        "landing": {
          "x": [
            -1.595,
            1.595
          ],
          "z": [
            0.4,
            1.23
          ],
          "height": -0.9318412055851895
        },
        "stairsBeyondDoorAndJambs": true,
        "sourcePhotoPages": [
          358,
          1139
        ],
        "exactSillUnverified": true
      },
      "modelSillSurveyed": false
    },
    {
      "id": "sea-27601-0",
      "code": "GUA",
      "source": "/art-v0130/models/guggenheim-annex/gua-near-v58.glb",
      "sourceSha256": "72b76b5e817b4d7c6e236bf34092e11138ad7effcd52d188de9828ef029c8f81",
      "placement": {
        "x": 111.33079837166588,
        "z": 177.104804599192,
        "angle": 0.4488104721516163,
        "groundY": 0
      },
      "surfaces": [
        {
          "kind": "flat",
          "x": [
            -2.164,
            0.094
          ],
          "z": [
            -6.77,
            -6.5005999999999995
          ],
          "height": 25.305
        },
        {
          "kind": "flat",
          "x": [
            -2.164,
            0.094
          ],
          "z": [
            -6.5005999999999995,
            -6.231199999999999
          ],
          "height": 25.48125
        },
        {
          "kind": "flat",
          "x": [
            -2.164,
            0.094
          ],
          "z": [
            -6.231199999999999,
            -5.9618
          ],
          "height": 25.6575
        },
        {
          "kind": "flat",
          "x": [
            -2.164,
            0.094
          ],
          "z": [
            -5.9618,
            -5.6924
          ],
          "height": 25.833750000000002
        },
        {
          "kind": "flat",
          "x": [
            -2.164,
            0.094
          ],
          "z": [
            -5.6924,
            -5.423
          ],
          "height": 26.01
        }
      ],
      "rails": [],
      "openFootprintCorridors": [
        {
          "x": [
            -1.81,
            -0.26
          ],
          "z": [
            -6.84,
            -5.86
          ]
        }
      ],
      "outdoorArrival": {
        "pathId": "uw-35-446-266",
        "point": [
          106.91796652988965,
          170.30506189256366
        ]
      }
    }
  ],
  "sitePaving": [{"id":"sea-4180-0","pathId":"uw-35-101-20","ring":[[-302.1,-275.08],[-295.73,-275.04],[-295.8,-264.24],[-302.21,-264.3]],"offset":0.286,"reference":"sea-4180-0-registered.png"}],
  "collisionFootprints": [
    {"id":"sea-4180-0","code":"METRO11352","bounds":[-299.63938458107134,-273.6453310508705,-296.42501693416415,-265.78173518910484],"rings":[[[[-299.63938458107134,-265.8095153017309],[-299.53792801401534,-265.80861916906565],[-299.53699688419425,-265.91403373072427],[-299.6384534512883,-265.9149298633786]]],[[[-299.5711017303143,-273.53991648922283],[-299.46964516046955,-273.53902035736724],[-299.46871403064847,-273.64443491902585],[-299.57017060053124,-273.6453310508705]]],[[[-296.59568756939103,-265.7826313217702],[-296.494231002335,-265.78173518910484],[-296.4932998713731,-265.88714975109474],[-296.59475643846713,-265.8880458837491]]],[[[-296.5274046349709,-273.51303253355394],[-296.4259480651261,-273.51213640169834],[-296.42501693416415,-273.61755096368825],[-296.526473504047,-273.6184470955328]]],[[[-296.5777081683695,-268.25990799490467],[-296.46844724903906,-268.25894292923675],[-296.46782649506343,-268.329219303897],[-296.5770874144212,-268.33018436955695]]],[[[-296.5536539528729,-270.98311751268113],[-296.44439303248447,-270.98215244732046],[-296.44377227850885,-271.0524288219807],[-296.5530331989246,-271.0533938873334]]],[[[-296.54785273633246,-265.89641683089445],[-296.5322440337021,-265.8962789643324],[-296.5113711816332,-268.2593220621777],[-296.5269798843947,-268.2594599287017]]],[[[-296.52628153618855,-268.33852085018964],[-296.5106728334227,-268.338382983667],[-296.48731696549424,-270.9825315801407],[-296.5029256684069,-270.9826694466208]]],[[[-296.5022273202008,-271.0617303681088],[-296.48661861728374,-271.06159250162995],[-296.4650474170043,-273.5036965209645],[-296.4806561200569,-273.50383438740397]]],[[[-298.72831539297556,-266.01231369787683],[-296.54309702397717,-265.9930123794063],[-296.5427866469962,-266.02815056673444],[-298.7280050162676,-266.0474518851257]]],[[[-298.66313628430635,-273.3913330201366],[-296.4779178579724,-273.3720317183136],[-296.4776074809914,-273.40716990564175],[-298.6628259075984,-273.4264712073855]]],[[[-297.268060424091,-267.86188496799565],[-296.68273407137616,-267.8567149731021],[-296.65014449042144,-271.54622464196126],[-297.23547085081515,-271.5513946346251]]]],"sourceSha256":"4493f08e8b3642e5e1b8db452384736e191ce7944e2ed13faf8e5abbfb550a68","replaceCanonicalFootprint":true,"cameraVolumes":[{"ring":[[-299.9830639465945,-265.3381483722478],[-296.080888297176,-265.3036817293614],[-296.00329403730575,-274.08822856564075],[-299.9054698086111,-274.1226951731369]],"bottom":[-0.09223200894545218,8.973050312377495e-05,12.161384721214501],"top":[-0.09223200894545218,8.973050312377495e-05,12.286384721214501]},{"ring":[[-299.63938458107134,-265.8095153017309],[-299.53792801401534,-265.80861916906565],[-299.53699688419425,-265.91403373072427],[-299.6384534512883,-265.9149298633786]],"bottom":[0.090539075657283,-0.05346933676275852,49.575936238507566],"top":[-0.09223200894545218,8.973050312377495e-05,12.176384721214502]},{"ring":[[-299.5711017303143,-273.53991648922283],[-299.46964516046955,-273.53902035736724],[-299.46871403064847,-273.64443491902585],[-299.57017060053124,-273.6453310508705]],"bottom":[0.10898229176416478,-0.05346933676277343,55.15782828815403],"top":[-0.09223200894545218,8.973050312377495e-05,12.176384721214502]},{"ring":[[-296.59568756939103,-265.7826313217702],[-296.494231002335,-265.78173518910484],[-296.4932998713731,-265.88714975109474],[-296.59475643846713,-265.8880458837491]],"bottom":[0.1609579303307462,-0.05346933676269729,70.4684056332298],"top":[-0.09223200894545218,8.973050312377495e-05,12.176384721214502]},{"ring":[[-296.5274046349709,-273.51303253355394],[-296.4259480651261,-273.51213640169834],[-296.42501693416415,-273.61755096368825],[-296.526473504047,-273.6184470955328]],"bottom":[0.1743707713966751,-0.07184954078831583,69.48888148166401],"top":[-0.09223200894545218,8.973050312377495e-05,12.176384721214502]},{"ring":[[-296.5777081683695,-268.25990799490467],[-296.46844724903906,-268.25894292923675],[-296.46782649506343,-268.329219303897],[-296.5770874144212,-268.33018436955695]],"bottom":[0.16095793033073946,-0.05346933676272441,70.81840563322058],"top":[-0.09223200894545218,8.973050312377495e-05,12.1463847212145]},{"ring":[[-296.5536539528729,-270.98311751268113],[-296.44439303248447,-270.98215244732046],[-296.44377227850885,-271.0524288219807],[-296.5530331989246,-271.0533938873334]],"bottom":[0.17437077139659515,-0.07184954078827391,69.8388814816517],"top":[-0.09223200894545218,8.973050312377495e-05,12.1463847212145]},{"ring":[[-296.54785273633246,-265.89641683089445],[-296.5322440337021,-265.8962789643324],[-296.5113711816332,-268.2593220621777],[-296.5269798843947,-268.2594599287017]],"bottom":[0,0,37.88086294227965],"top":[-0.09223200894545218,8.973050312377495e-05,12.0763847212145]},{"ring":[[-296.52628153618855,-268.33852085018964],[-296.5106728334227,-268.338382983667],[-296.48731696549424,-270.9825315801407],[-296.5029256684069,-270.9826694466208]],"bottom":[0,0,37.88086294227965],"top":[-0.09223200894545218,8.973050312377495e-05,12.0763847212145]},{"ring":[[-296.5022273202008,-271.0617303681088],[-296.48661861728374,-271.06159250162995],[-296.4650474170043,-273.5036965209645],[-296.4806561200569,-273.50383438740397]],"bottom":[0,0,37.88086294227965],"top":[-0.09223200894545218,8.973050312377495e-05,12.0763847212145]},{"ring":[[-298.72831539297556,-266.01231369787683],[-296.54309702397717,-265.9930123794063],[-296.5427866469962,-266.02815056673444],[-298.7280050162676,-266.0474518851257]],"bottom":[0,0,37.88086294227965],"top":[-0.09223200894545218,8.973050312377495e-05,12.0763847212145]},{"ring":[[-298.66313628430635,-273.3913330201366],[-296.4779178579724,-273.3720317183136],[-296.4776074809914,-273.40716990564175],[-298.6628259075984,-273.4264712073855]],"bottom":[0,0,37.88086294227965],"top":[-0.09223200894545218,8.973050312377495e-05,12.0763847212145]},{"ring":[[-297.268060424091,-267.86188496799565],[-296.68273407137616,-267.8567149731021],[-296.65014449042144,-271.54622464196126],[-297.23547085081515,-271.5513946346251]],"bottom":[0,0,37.738077582069174],"top":[0,0,37.808077582069174]},{"ring":[[-297.0518112826243,-268.0444647865737],[-296.9542568904412,-268.04360312077665],[-296.9528601942681,-268.2017249636832],[-297.0504145865061,-268.2025866294643]],"bottom":[0.09053907565725886,-0.05346933676274342,49.62093623850434],"top":[0,0,37.738077582069174]},{"ring":[[-297.0231014179723,-271.294747112658],[-296.92554702466174,-271.2938854471883],[-296.92415032848874,-271.45200729009485],[-297.0217047218541,-271.4528689555486]],"bottom":[0.09053907565722341,-0.07184954078830806,44.661975432293566],"top":[0,0,37.738077582069174]},{"ring":[[-299.70673029112805,-265.6959021261838],[-296.4289027414187,-265.6669501473781],[-296.4282819874275,-265.7372265220428],[-299.70610953795597,-265.7661785006107]],"bottom":[-0.09223200894545218,8.973050312377495e-05,12.096384721214502],"top":[-0.09223200894545218,8.973050312377495e-05,12.186384721214502]},{"ring":[[-299.63611961779895,-273.68983971724725],[-296.3582919749193,-273.6608877654938],[-296.3576712209281,-273.7311641401585],[-299.63549886462687,-273.76011609167415]],"bottom":[-0.09223200894545218,8.973050312377495e-05,12.096384721214502],"top":[-0.09223200894545218,8.973050312377495e-05,12.186384721214502]}],"provenance":"Exact registered station-glazing, bench and roof outline from textured near/far geometry."},
    {"id": "sea-76205-0", "replaceCanonicalFootprint": true, "bounds": [263.0809628588613, -21.21921048965305, 308.7565982177621, 26.213054593652487], "rings": [[[[264.308776287833, -3.9023277157158507], [264.69927108271935, -0.1833296691789208], [265.0353637888038, -0.2186194033177918], [265.0366415986791, -0.20643719006329775], [266.394072355004, 12.737518817186356], [266.49373151548207, 13.682669485919178], [266.58962360851, 14.600524534471333], [265.4833370944252, 14.71701167523861], [265.6751341726631, 16.549621237441897], [265.81337028641735, 17.86798456924346], [265.66114692331644, 16.608964313641806], [265.2160540720022, 16.655699063029807], [265.61278016680694, 20.434042823075302], [266.07840027353546, 20.38515271186881], [266.2033188359346, 21.570350629277527], [270.9352620005375, 21.07168096024543], [271.009973913664, 21.776719669811428], [277.477356672287, 21.098183604888618], [277.42743362137116, 20.62406080402434], [277.6553517446155, 20.59935617260635], [281.2750970920315, 20.220339925959706], [281.2664326601662, 20.12907846737653], [281.24918417667504, 19.96365420240909], [280.54973289568443, 13.278647310100496], [280.5420117988251, 13.220961144194007], [279.91284586000256, 13.287440991960466], [279.8751117076026, 12.91968143824488], [279.4046554401284, 8.433758662082255], [279.1093423035927, 5.625505083240569], [286.68301461753435, 4.8305817218497396], [289.1891910410486, 7.345005868002772], [289.1937273807125, 7.399681344628334], [289.4462383816717, 9.876919754780829], [288.1787390309619, 10.003936676308513], [289.10349432833027, 19.169546596705914], [289.58122704713605, 23.903778234496713], [292.7362826638855, 23.58652070723474], [292.89230073522776, 25.124519743025303], [295.88923119567335, 24.82090545631945], [296.02895076863933, 26.213054593652487], [300.32695308036637, 25.781380170956254], [300.186632695375, 24.367846753448248], [305.60619746358134, 23.822356237098575], [305.44949717761483, 22.26007502991706], [308.7565982177621, 21.926344994455576], [308.4610318648629, 19.002292250283062], [307.0051010128809, 19.14990417100489], [306.47333790326957, 13.89146229159087], [307.76813010592014, 13.760578405112028], [305.89743229781743, -4.762357131578028], [305.6393444875721, -7.327743680216372], [304.81579743814655, -15.485943522304296], [293.79123379208613, -14.374451021663845], [291.5390127731953, -14.146663092076778], [291.42218590248376, -15.265040788799524], [290.9851828237297, -19.428786374628544], [286.702882960788, -18.979251840151846], [286.46933919773437, -21.21921048965305], [278.7040532398969, -20.406602554023266], [277.2877774896333, -20.257104510441422], [273.3124662711052, -19.840596467256546], [273.2507125027478, -20.411892104893923], [266.8835001005791, -19.745270546525717], [266.9377169283107, -19.228666089475155], [263.0809628588613, -18.824589521624148], [264.6203048671596, -4.1756527572870255], [264.77573472459153, -2.6938363259607905], [264.6252867598787, -3.9355613152806477], [264.308776287833, -3.9023277157158507]]]], "sourceSha256": "be88626ffc61c34fcec0ab576bb83c1cb2aabc0d1c93148cf7ec28849ecf9b94", "provenance": "Campus outline with photo-registered masonry entrance and bay"},
    {
      "id": "sea-58585-0",
      "code": "ECE",
      "source": "/art-v0130/models/ece-cse-complete-q-v2/near-architecture-v14.glb",
      "sourceSha256": "971a34e39fc879a8b4366f96c99b822c6350ff4cd8dc790f011c4d8071830001",
      "rings": [
        [
          [
            [
              177.5146832539467,
              289.14008507411927
            ],
            [
              163.19853767077439,
              286.2503381157294
            ],
            [
              121.88032051769551,
              270.2926126383245
            ],
            [
              110.49169033719227,
              270.70099427644163
            ],
            [
              62.47870854521172,
              293.98153762333095
            ],
            [
              76.48277498804964,
              304.0982325831428
            ],
            [
              78.42783568613231,
              303.1321355868131
            ],
            [
              84.15679600229487,
              307.19899738859385
            ],
            [
              82.21183735062368,
              308.05838585086167
            ],
            [
              89.26174574147444,
              312.38074962887913
            ],
            [
              115.47528194542976,
              299.8783274628222
            ],
            [
              118.79712529282551,
              299.6386887449771
            ],
            [
              132.9358470783336,
              305.21886207628995
            ],
            [
              133.2253631320782,
              304.67429938726127
            ],
            [
              133.81954340799712,
              304.9928229888901
            ],
            [
              131.41053494776133,
              309.51394263561815
            ],
            [
              129.4827388500562,
              308.4890490565449
            ],
            [
              122.3630901145516,
              321.86628118064255
            ],
            [
              124.72730169654824,
              323.1258262451738
            ],
            [
              121.46425170334987,
              329.2559248274192
            ],
            [
              169.7715338562848,
              354.96641404926777
            ],
            [
              174.20989616715815,
              349.6567392349243
            ],
            [
              176.98879065550864,
              344.5826987810433
            ],
            [
              180.2295203214744,
              338.3878238424659
            ],
            [
              188.11791073239874,
              321.8569271117449
            ],
            [
              189.85826794675086,
              316.29943792521954
            ],
            [
              192.07592623401433,
              309.2176582822576
            ],
            [
              177.69834064261522,
              305.2231782693416
            ],
            [
              175.1514406708302,
              309.93708224594593
            ],
            [
              170.59889788855799,
              307.6020601699129
            ],
            [
              177.5146832539467,
              289.14008507411927
            ]
          ],
          [
            [
              143.13927665012716,
              300.23725336305716
            ],
            [
              168.22907688517589,
              313.5907481111023
            ],
            [
              171.38752491805056,
              315.2717626597972
            ],
            [
              164.997858466936,
              327.27726817366465
            ],
            [
              136.74961019901264,
              312.2427588769246
            ],
            [
              139.24384114947756,
              307.55636348246037
            ],
            [
              143.13927665012716,
              300.23725336305716
            ]
          ]
        ]
      ],
      "bounds": [
        62.47870854521172,
        270.2926126383245,
        192.07592623401433,
        354.96641404926777
      ],
      "coordinateFrame": "unchanged-campus-world-XZ",
      "purpose": "Actual at-grade ECE/CSE opaque bodies; no overhead roof or balcony projection",
      "sourceLayout": "ECE-CSE-envelope-layout-v11.json",
      "canonicalGeometryUnchanged": true
    },
    {
      "id": "sea-27601-0",
      "code": "GUA",
      "bounds": [
        95.96869861950513,
        165.4635266921483,
        128.47819888266454,
        189.89249836673693
      ],
      "rings": [
        [
          [
            [
              96.38928332342161,
              178.20699698851897
            ],
            [
              122.85059214981034,
              165.4635266921483
            ],
            [
              128.47819888266454,
              177.14902807036626
            ],
            [
              102.01689005627581,
              189.89249836673693
            ]
          ]
        ],
        [
          [
            [
              95.96869861950513,
              176.86120409701172
            ],
            [
              105.31169393886675,
              172.36172207544672
            ],
            [
              105.89962047109631,
              173.5825281176584
            ],
            [
              96.55662515173469,
              178.0820101392234
            ]
          ]
        ],
        [
          [
            [
              106.40791016153463,
              172.333261696676
            ],
            [
              106.52503546447744,
              172.27685546111155
            ],
            [
              106.93506540761909,
              173.12826631711894
            ],
            [
              106.81794010467628,
              173.1846725526834
            ]
          ]
        ],
        [
          [
            [
              108.72338730432725,
              171.2181538089786
            ],
            [
              108.84051260727006,
              171.16174757341415
            ],
            [
              109.25054255041171,
              172.01315842942154
            ],
            [
              109.13341724746888,
              172.069564664986
            ]
          ]
        ]
      ],
      "source": "/art-v0130/models/guggenheim-annex/gua-near-v58.glb",
      "sourceSha256": "72b76b5e817b4d7c6e236bf34092e11138ad7effcd52d188de9828ef029c8f81"
    }
  ]
};

// Shared Oak Hall solid exterior bodies and canopy posts.
BUILDING_ACCESS.collisionFootprints.push({"id":"sea-99164-0","bounds":[118.1660181961488,-385.7415245684481,213.69172269663068,-317.0107819195837],"rings":[[[[150.75290112700944,-331.09699048539983],[202.37901389803432,-385.7415245684481],[213.69172269663068,-375.05370025111574],[162.0656099256058,-320.4091661680675]]],[[[142.09424053644761,-360.3720898963511],[137.89579184213653,-355.93089357204735],[135.493662487017,-358.20172694325447],[128.32978640170768,-350.62364685628563],[126.63518980832305,-352.2255226187408],[118.8824822154129,-344.0245656557381],[126.02322288125289,-337.27412474155426],[118.1660181961488,-328.9625262413174],[123.08297587290872,-324.31432028580457],[120.94296169385781,-322.05057398881763],[126.27404331904837,-317.0107819195837],[133.87922752089798,-325.0556852184236],[134.1478744322667,-324.8018193067983],[149.95231526262785,-341.52014321886315],[155.65314835547818,-347.55428663046763]]],[[[151.25469688636747,-333.2298819537803],[151.50192536122705,-333.4915651233167],[151.78541546155813,-333.22373427555215],[151.53818698669855,-332.96205110601574]]],[[[156.67998841800826,-338.97237372971756],[156.92721689286785,-339.2340568992539],[157.21070699319893,-338.96622605148934],[156.96347851833934,-338.704542881953]]],[[[162.10527994964906,-344.7148655056548],[162.35250842450864,-344.97654867519117],[162.63599852483972,-344.7087178274266],[162.38877004998014,-344.44703465789024]]],[[[167.53057148128985,-350.457357281592],[167.7777999561494,-350.7190404511284],[168.0612900564805,-350.45120960336385],[167.81406158162093,-350.18952643382744]]],[[[172.95586301293062,-356.19984905752926],[173.2030914877902,-356.4615322270656],[173.48658158812128,-356.19370137930105],[173.2393531132617,-355.9320182097647]]],[[[178.38115454457142,-361.94234083346646],[178.628383019431,-362.20402400300287],[178.91187311976208,-361.9361931552383],[178.6646446449025,-361.6745099857019]]],[[[183.8064460762122,-367.6848326094037],[184.0536745510718,-367.94651577894007],[184.33716465140287,-367.6786849311755],[184.0899361765433,-367.41700176163914]]],[[[189.231737607853,-373.4273243853409],[189.4789660827126,-373.6890075548773],[189.76245618304367,-373.42117670711275],[189.51522770818409,-373.15949353757634]]],[[[194.6570291394938,-379.16981616127816],[194.90425761435338,-379.4314993308146],[195.18774771468446,-379.16366848305],[194.94051923982488,-378.9019853135136]]],[[[200.0823206711346,-384.9123079372154],[200.32954914599418,-385.17399110675177],[200.61303924632526,-384.9061602589872],[200.36581077146568,-384.64447708945085]]]],"sourceSha256":"ce44f45e57b9d7a31d41a9f453d6ee6536068514168ac2220215c4bf0946908f"});

// Surveyed Guthrie body and photographed staircase side walls.
BUILDING_ACCESS.collisionFootprints.push({"id":"sea-28352-0","code":"GTH","source":"/art-v0130/models/guthrie-v143-near.glb","sourceSha256":"144edd90bee71f0d324715f5ce650d36b8126df65866bc0eb24c84f6fa76026d","rings":[[[[-241.2187,231.4037],[-241.2346,233.5501],[-243.1706,233.5375],[-243.2502,246.3703],[-243.5002,246.3688],[-243.5031,246.8288],[-243.2531,246.8303],[-243.256,247.3079],[-243.2704,249.6291],[-243.2757,250.4746],[-243.2772,250.7246],[-243.5272,250.7231],[-243.5282,250.8727],[-243.5286,250.9476],[-243.5287,250.9531],[-243.279,250.9546],[-243.28,251.1224],[-243.2731,251.1224],[-243.2589,251.1225],[-243.01,251.1246],[-243.0001,251.1247],[-243.0,251.1242],[-242.607,251.1267],[-240.8837,251.1378],[-240.8852,251.3678],[-240.6352,251.3694],[-240.6593,255.1862],[-240.6745,255.2095],[-240.6881,255.8563],[-240.6635,255.8565],[-240.6647,256.0465],[-240.9147,256.0449],[-240.9161,256.261],[-240.9023,256.2611],[-240.6661,256.2626],[-240.6662,256.2765],[-242.42,256.2655],[-243.01,256.2618],[-244.0355,256.2554],[-246.5964,256.2393],[-246.8764,256.2376],[-246.8764,256.242],[-246.8782,256.5176],[-246.8781,256.5176],[-246.8802,256.8575],[-246.904,260.7648],[-246.9167,262.8422],[-246.9177,263.0145],[-246.9187,263.1769],[-246.9188,263.1769],[-246.9188,263.1794],[-246.9204,263.4569],[-246.9179,263.4569],[-246.6404,263.4586],[-246.6404,263.4585],[-239.3658,263.5037],[-239.3617,262.8909],[-237.7307,262.9],[-237.7349,263.5337],[-237.7492,265.69],[-237.7493,265.69],[-237.7494,265.7043],[-237.7511,265.97],[-237.7527,266.22],[-237.526,266.2214],[-237.5227,266.2214],[-237.5211,265.9715],[-237.4711,265.9719],[-237.4711,265.9718],[-237.2928,265.9729],[-237.2711,265.973],[-233.2851,265.9982],[-233.2866,266.2482],[-232.8469,266.2509],[-232.8267,266.2511],[-232.8266,266.2347],[-232.8251,266.0011],[-228.589,266.0278],[-228.5906,266.2778],[-228.5413,266.2781],[-228.1632,266.2805],[-228.1306,266.2807],[-228.1291,266.0307],[-223.893,266.0574],[-223.8946,266.3074],[-223.4346,266.3103],[-223.433,266.0603],[-219.197,266.087],[-219.1986,266.337],[-219.1529,266.3373],[-218.7932,266.3396],[-218.7386,266.3399],[-218.7383,266.2959],[-218.737,266.0899],[-214.501,266.1166],[-214.5025,266.3666],[-214.0425,266.3695],[-214.041,266.1195],[-209.8049,266.1462],[-209.8065,266.3962],[-209.6055,266.3975],[-209.5765,266.3977],[-209.5749,266.1477],[-209.4834,266.1482],[-209.4638,263.0537],[-207.6284,263.0661],[-207.6327,263.7796],[-200.3433,263.8247],[-200.2518,263.8252],[-200.2063,256.6846],[-200.206,256.6846],[-200.2043,256.4046],[-200.2246,256.4044],[-200.4843,256.4019],[-200.4843,256.4029],[-200.6273,256.4021],[-200.8051,256.401],[-201.0639,256.3994],[-201.9433,256.3942],[-203.2505,256.3863],[-203.5121,256.3847],[-204.137,256.381],[-204.1347,256.001],[-204.1208,253.7434],[-204.1087,251.7711],[-204.1064,251.3964],[-203.6974,251.3994],[-203.6974,251.3996],[-203.5374,251.4007],[-203.4776,251.401],[-203.4174,251.4014],[-203.1674,251.403],[-203.1661,251.2025],[-203.166,251.173],[-203.4157,251.1714],[-203.4154,251.1214],[-203.4156,251.1214],[-203.4147,250.9814],[-203.3997,250.9815],[-203.1047,250.9834],[-203.104,250.8727],[-203.0822,247.4195],[-203.3771,247.4176],[-203.3921,247.4175],[-203.3909,247.2276],[-203.1409,247.2291],[-203.138,246.7725],[-203.138,246.7691],[-203.1404,246.7691],[-203.388,246.7676],[-203.3868,246.5776],[-203.3718,246.5777],[-203.0768,246.5795],[-203.0661,244.888],[-203.0542,243.0156],[-203.3642,243.0137],[-203.363,242.8237],[-203.113,242.8253],[-203.1101,242.3653],[-203.3601,242.3637],[-203.3589,242.1737],[-203.0489,242.1757],[-203.0395,240.6889],[-203.0281,238.9033],[-203.0263,238.6118],[-203.3213,238.6099],[-203.3363,238.6098],[-203.3351,238.4198],[-203.0851,238.4214],[-203.0822,237.9622],[-203.0822,237.9614],[-203.0828,237.9614],[-203.3263,237.9599],[-203.3322,237.9598],[-203.331,237.7698],[-203.021,237.7718],[-203.0013,234.6658],[-202.9984,234.2079],[-203.3084,234.2059],[-203.3072,234.016],[-203.0572,234.0175],[-203.0559,233.816],[-203.0557,233.7875],[-203.3078,233.7859],[-205.324,233.7726],[-205.311,231.6342],[-205.3094,231.3824],[-205.5394,231.3809],[-205.541,231.6309],[-205.731,231.6297],[-205.7297,231.4188],[-205.729,231.3197],[-207.2243,231.3102],[-208.8757,231.2997],[-209.3776,231.3132],[-209.3794,231.5915],[-209.3795,231.6065],[-209.5695,231.6053],[-209.5679,231.3553],[-210.0279,231.3523],[-210.0281,231.3781],[-210.0295,231.6023],[-210.2195,231.6011],[-210.2194,231.5861],[-210.2178,231.3357],[-211.6494,231.3741],[-212.51,231.3862],[-213.1886,231.3957],[-213.8668,231.3931],[-213.8679,231.5629],[-213.868,231.5779],[-214.058,231.5767],[-214.0564,231.3267],[-214.5164,231.3238],[-214.5165,231.3453],[-214.5179,231.5737],[-214.7079,231.5725],[-214.7068,231.3899],[-216.7171,231.3822],[-217.6183,231.3787],[-218.3553,231.3759],[-218.3563,231.5343],[-218.3564,231.5493],[-218.5464,231.5481],[-218.5448,231.2981],[-218.9786,231.2953],[-219.0048,231.2952],[-219.0049,231.3162],[-219.0064,231.5452],[-219.1964,231.544],[-219.1963,231.529],[-219.1953,231.3737],[-222.8444,231.449],[-222.8448,231.5057],[-222.8449,231.5176],[-222.8449,231.5207],[-223.0349,231.5195],[-223.0333,231.2695],[-223.471,231.2667],[-223.4933,231.2666],[-223.4934,231.2893],[-223.4949,231.5166],[-223.6849,231.5154],[-223.6847,231.4811],[-223.6846,231.4662],[-224.0286,231.4704],[-225.1171,231.4837],[-225.3177,231.49],[-225.2958,231.5051],[-227.5233,231.4909],[-227.5218,231.2409],[-227.9817,231.238],[-227.9818,231.2471],[-227.9833,231.488],[-228.2333,231.4864],[-229.6452,231.4774],[-230.8631,231.4697],[-232.0118,231.4623],[-232.0102,231.2123],[-232.4621,231.2095],[-232.4702,231.2094],[-232.4702,231.2159],[-232.4718,231.4594],[-236.5003,231.4338],[-236.4987,231.1838],[-236.9587,231.1808],[-236.9603,231.4308],[-241.2187,231.4037]]],[[[-204.05513557472185,256.20150327180033],[-201.455184731077,256.21749428443496],[-201.453708829794,255.9774989518634],[-204.05365967343886,255.9615079392288],[-204.05513557472185,256.20150327180033]]],[[[-204.02819796709036,251.8215862140369],[-201.4282471234455,251.8375772266715],[-201.4267712208373,251.59758177489803],[-204.0267220638196,251.58159070266248],[-204.02819796709036,251.8215862140369]]]],"bounds":[-246.9204,231.1808,-200.2043,266.3977],"replaceCanonicalFootprint":true,"cameraVolumes":[{"id":"low-main-building","ring":[[-241.218733813148,231.40370492171496],[-241.23463225422893,233.55006450042129],[-243.17058835818898,233.53745490405709],[-243.27865588630084,250.9546070350334],[-243.280043052393,251.12235482782125],[-240.63372482790146,251.13940695207566],[-240.66619932826143,256.2764894226566],[-246.87641940347385,256.23756457399577],[-246.92039382795338,263.45687950216234],[-246.65213580662385,263.45844283048064],[-239.3657803668175,263.5037338808179],[-239.36169817962218,262.890886974521],[-237.73065744247288,262.89996311068535],[-237.75110539013986,265.96999897807837],[-209.57493143435568,266.14769496489316],[-209.48341176135,266.1482237391174],[-209.46375149232335,263.053708601743],[-207.62840554106515,263.06614499818534],[-207.63266110792756,263.7796020936221],[-200.34331032424234,263.8247093502432],[-200.2517906546127,263.8252381226048],[-200.20504281832837,256.4839384453371],[-200.20427144540008,256.40461260452867],[-203.51210367679596,256.3847454888746],[-204.13704170356505,256.3810030017048],[-204.10638370807283,251.3963793590665],[-203.4174057567725,251.40142269991338],[-203.30570876027923,233.78595732245594],[-205.3239914017031,233.7725605685264],[-205.31101931608282,231.6323834368959]],"bottom":[0,0,16.466799240112305],"top":[0.0002778315606109033,-0.0013377377702227296,33.5552738822616]},{"id":"central-raised-roof-body","ring":[[-237.73065744247288,262.89996311068535],[-237.75110539013986,265.96999897807837],[-209.57493143435568,266.14769496489316],[-209.48341176135,266.1482237391174],[-209.46375149232335,263.053708601743],[-209.41667469499004,263.0540275964886],[-209.26144801227545,249.09123446587307],[-237.58969750278186,248.77630462666482],[-237.74671155910664,262.8998737754865]],"bottom":[0,0,33.02],"top":[-0.00033271335773730646,0.01566861380404366,33.429930874403446]},{"id":"west-high-tower","ring":[[-240.66619932826143,256.2764894226566],[-246.87641940347385,256.23756457399577],[-246.92039382795338,263.45687950216234],[-246.65213580662385,263.45844283048064],[-239.3657803668175,263.5037338808179],[-239.36169817962218,262.890886974521],[-239.34671144851626,262.8909703701156],[-239.2731945580468,256.2780536003985],[-240.66611132479895,256.26256831411104]],"bottom":[0,0,19.07],"top":[-0.0001246632371129094,-0.004104943861591692,41.89146716922048]},{"id":"east-high-tower","ring":[[-207.62840554106515,263.06614499818534],[-207.63266110792756,263.7796020936221],[-200.34331032424234,263.8247093502432],[-200.2517906546127,263.8252381226048],[-200.20504281832837,256.4839384453371],[-200.20427144540008,256.40461260452867],[-203.51210367679596,256.3847454888746],[-204.13704170356505,256.3810030017048],[-204.1368427188571,256.3486504664615],[-207.56159664443916,256.3105769101172],[-207.63669878849578,263.0660888027238]],"bottom":[0,0,19.07],"top":[-0.0001246632371129094,-0.004104943861591692,41.89146716922048]},{"id":"north-service-strip","ring":[[-231.4264644804532,243.81653863320537],[-209.7770738854376,244.0572184924155],[-209.82115179308232,248.02206973648345],[-231.47054238809793,247.7813898772733]],"bottom":[0,0,33.1],"top":[-0.008954886847436323,0.012801650013306002,31.022480629830213]},{"id":"north-gabled-service-roof","ring":[[-225.52158256722763,233.61966310076224],[-208.27421612093934,233.81140492877444],[-208.3109380221995,237.11457614709718],[-225.55768733965064,236.86732297182692]],"bottom":[0,0,33.08],"top":[-0.0023894655525491396,0.16012949697399265,-2.3044025726602797]},{"id":"north-gabled-service-roof","ring":[[-225.55768733965064,236.86732297182692],[-208.3109380221995,237.11457614709718],[-208.34544028188355,240.218088417555],[-225.59280672817184,240.02634658954284]],"bottom":[0,0,33.08],"top":[0.002343582731854546,-0.17001670713149838,76.96402040821474]},{"id":"east-roof-service-housing","ring":[[-207.88502366743464,249.31307641680147],[-208.43697992046674,249.45251121570973],[-208.48568512786332,250.04479638272912],[-208.19260981487085,255.69172330301708],[-207.0625593790322,255.31849305542363],[-206.82539414298694,254.67744078584897],[-206.33781269375802,250.33507959554805],[-206.42318644628705,249.83813135770535],[-206.4782249818699,249.71755641376814]],"bottom":[0,0,33.0053829287733],"top":[-0.151655525579227,-0.05072503813251714,16.78926763861278]},{"id":"south-sloping-roof-service-housing","ring":[[-223.18708648003818,262.026104126339],[-226.58709564314563,262.03614396757905],[-226.6558974098417,264.1620592615161],[-226.6161943144726,264.8342702901729],[-226.4754165244619,265.4921373371339],[-220.07607876146133,265.93293348891075],[-219.54217387558776,265.2825431576173],[-219.2137891974148,264.2774778951834],[-219.04225021961634,262.32551167495217],[-219.04936072593634,262.28522895495934],[-219.6237626404049,262.1760059926368]],"bottom":[0,0,37.45977403148356],"top":[0.0033661887648575224,-0.27775010465946964,112.82682651287004]},{"id":"south-projection","ring":[[-208.20063134086064,269.48303190831825],[-208.24119259850107,266.2936393925544],[-236.87495654294057,265.97531309858516],[-236.90933427419162,268.9350795289841],[-208.20063134086064,269.48303190831825]],"bottom":[0.0005572283695852517,-0.0460084916728195,33.99633476573559],"top":[0.0005572283695852517,-0.0460084916728195,34.11633476573559]},{"id":"stevens-entry-brow","ring":[[-204.13624215192027,256.25100546050817],[-204.1073352847634,251.55109435570725],[-203.4573475787803,251.55509211393107],[-203.48625444593716,256.25500321873204]],"bottom":[0,0,22.104999999999997],"top":[0,0,22.638]}]});

// Registered Bagley compound body. Keep canonical guards in unresolved lower wings.
BUILDING_ACCESS.collisionFootprints.push({"id":"sea-99092-0","sourceSha256":"f1453f5c68baa04f988c31a28353fbeb26167fa7aee839f3474c107aa7720814","rings":[[[[-110.40754726191517,281.711402695626],[-99.9327451166464,302.9127308577299],[-101.6072878849227,303.7401206055656],[-89.60705765185412,328.02915468718857],[-89.05376074707601,327.75749556999654],[-79.53895944426768,347.0136925596744],[-79.6472085948335,347.06553653627634],[-78.24794067186303,349.8914731135592],[-73.221298788907,347.40621955227107],[-73.29888199549168,347.2467908458784],[-67.46637993562035,344.3670759871602],[-67.3596071624197,344.5865877857432],[-62.594363364274614,342.23358511645347],[-65.38363468903117,336.5875517837703],[-65.09491509781219,336.4453327599913],[-65.48286702623591,335.65759070776403],[-65.88274933432695,335.854735721834],[-67.37582979467697,332.8363245567307],[-67.06616840942297,332.6813165033236],[-67.57041316933464,331.65912932157516],[-46.08947293634992,321.04536625090986],[-41.11870449106209,331.10794393811375],[-40.652256017550826,331.43625645991415],[-39.41888100246433,330.85287425946444],[-31.220856579602696,327.0013492135331],[-25.643912180676125,324.24462063610554],[-36.85212120402139,301.5672169094905],[-35.21062682464253,300.7559565678239],[-46.28331426822115,278.34605953097343],[-47.239307217649184,278.81794295925647],[-58.312082797521725,256.4049483984709],[-63.738791601965204,259.0843528630212],[-65.30627098237164,255.90952350571752],[-69.77087839168962,258.1137727415189],[-68.46190813917201,260.7655372619629],[-74.04785857792012,263.52561987005174],[-68.89280696539208,273.96093966718763],[-90.6143874716945,284.6911718826741],[-95.68196742422879,274.4362045843154]]],[[[-31.220856579602696,327.0013492135331],[-39.41888100246433,330.85287425946444],[-36.56848177232314,338.24388250522316],[-37.25342701957561,340.22613040264696],[-40.5357659207657,339.1630910327658],[-40.57490933989175,339.28619724791497],[-51.486661383416504,374.3540080972016],[-51.514657052000985,374.44319932628423],[-42.082525282283314,377.1958507159725],[-42.50213604408782,380.26800135336816],[-53.427154251839966,384.91858197283],[-47.090222901897505,398.3658552058041],[-46.22319559508469,400.2587959161028],[-46.200528300134465,400.30386145506054],[-45.096360579365864,402.717467173934],[-23.750417186645798,392.6166270049289],[-24.051408439758234,391.99105032905936],[-27.126634972635657,385.60321154724807],[-26.24284415191505,383.3196614049375],[-24.569452851195827,383.9675820535049],[-11.282985053956509,349.66819445230067],[-13.033460908569396,348.9889378231019],[-11.99907918588724,346.6371530937031],[-2.10204512742348,341.9605516679585],[-8.02691472729203,329.2942411992699],[-21.918534317985177,335.7656645840034],[-21.487467139959342,336.35098471306264],[-22.471921398420818,340.04553757980466],[-25.109416516148485,339.3637014757842]]],[[[-51.514657052000985,374.44319932628423],[-51.486661383416504,374.3540080972016],[-42.87960127518198,346.69293637928985],[-49.29023479501322,345.7254441884691],[-41.897354293535685,342.073260403193],[-41.359450549160925,341.8075286180177],[-40.57490933989175,339.28619724791497],[-40.5357659207657,339.1630910327658],[-37.800002761595294,340.0491128703689],[-37.06716389626962,339.6870804770916],[-36.56848177232314,338.24388250522316],[-37.78862076771318,335.0800950327389],[-43.868324787200635,338.08355172797593],[-45.25907700070805,335.268341561643],[-57.99028221151299,341.55773055266377],[-56.46571429522542,344.6438152308061],[-61.12736118584871,346.84327750466764],[-59.79529106733389,349.39178730454296],[-67.38593232899439,353.1098408950493],[-66.95768830715679,353.9648544145748],[-65.20699626032729,357.46015287097543],[-60.65714763919823,366.54400343913585],[-67.77268932166044,369.64537651557475],[-64.93789129157085,375.6197475036606],[-64.56454719870817,375.4426491493359],[-61.71950878784992,374.093247349374],[-58.56525862647686,380.57787026278675],[-59.91799030546099,381.19860764965415],[-61.79035675153136,382.0575565882027],[-58.9827102549113,387.9948367629638],[-53.342960790823945,385.30370269569505],[-53.2635300044705,385.26580049870796],[-53.427154251839966,384.91858197283],[-45.167528978395126,381.40261042108983],[-42.83463758988084,380.28941850878124],[-51.41235483341097,374.743790456083],[-51.30616665569052,374.50404467844345]]]],"bounds":[-110.40754726191517,255.90952350571752,-2.10204512742348,402.717467173934]});

BUILDING_ACCESS.collisionFootprints = [...BUILDING_ACCESS.collisionFootprints.filter(entry => !FOSTER_SITE.bodies.some(b => b.id === entry.id)), ...FOSTER_SITE.bodies];

if(BUILDING_ACCESS.geometryHash===REVIEWED_CANOPY_SITES.geometryHash){
  BUILDING_ACCESS.collisionFootprints.push(...REVIEWED_CANOPY_SITES.bodies);
  BUILDING_ACCESS.sitePaving.push(...REVIEWED_CANOPY_SITES.paving);
}
if(BUILDING_ACCESS.geometryHash===CHEMICAL_CONSTRUCTION.geometryHash){
 BUILDING_ACCESS.collisionFootprints.push(CHEMICAL_CONSTRUCTION.body);
 BUILDING_ACCESS.buildings.push({
  id:CHEMICAL_CONSTRUCTION.id,placement:{x:0,z:0,angle:0,groundY:0},
  rails:[],surfaces:[],outdoorArrival:CHEMICAL_CONSTRUCTION.arrival
 });
}

if(BUILDING_ACCESS.geometryHash==="e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d"){
 for(const site of [
  {
    "id": "sea-17829-0",
    "code": "PAES",
    "bounds": [
      -209.68,
      295.23,
      -204.54,
      300.57
    ],
    "rings": [
      [
        [
          [
            -206.96,
            300.57
          ],
          [
            -205.78,
            300.38
          ],
          [
            -204.98,
            299.8
          ],
          [
            -204.63,
            298.92
          ],
          [
            -204.54,
            297.89
          ],
          [
            -204.73,
            296.81
          ],
          [
            -205.06,
            296.16
          ],
          [
            -205.77,
            295.54
          ],
          [
            -206.5,
            295.32
          ],
          [
            -207.44,
            295.23
          ],
          [
            -208.26,
            295.54
          ],
          [
            -208.96,
            296.12
          ],
          [
            -209.46,
            296.68
          ],
          [
            -209.66,
            297.53
          ],
          [
            -209.68,
            298.29
          ],
          [
            -209.44,
            299.11
          ],
          [
            -208.98,
            299.84
          ],
          [
            -208.3,
            300.31
          ],
          [
            -207.72,
            300.5
          ],
          [
            -206.96,
            300.57
          ]
        ]
      ]
    ],
    "cameraVolumes": [
      {
        "ring": [
          [
            -206.96,
            300.57
          ],
          [
            -205.78,
            300.38
          ],
          [
            -204.98,
            299.8
          ],
          [
            -204.63,
            298.92
          ],
          [
            -204.54,
            297.89
          ],
          [
            -204.73,
            296.81
          ],
          [
            -205.06,
            296.16
          ],
          [
            -205.77,
            295.54
          ],
          [
            -206.5,
            295.32
          ],
          [
            -207.44,
            295.23
          ],
          [
            -208.26,
            295.54
          ],
          [
            -208.96,
            296.12
          ],
          [
            -209.46,
            296.68
          ],
          [
            -209.66,
            297.53
          ],
          [
            -209.68,
            298.29
          ],
          [
            -209.44,
            299.11
          ],
          [
            -208.98,
            299.84
          ],
          [
            -208.3,
            300.31
          ],
          [
            -207.72,
            300.5
          ]
        ],
        "bottom": [
          0,
          0,
          13.485823036714153
        ],
        "top": [
          0.045212394215933115,
          -0.018552338086330167,
          34.700180915390554
        ]
      }
    ],
    "replaceCanonicalFootprint": true,
    "source": "/art-v0130/models/pab-east-sites/PAES-exterior-near-v1.glb",
    "sourceSha256": "9d41106aa490da165023f2014712a3f42e93fa7b52af7c7d6e494b3d8022e33e"
  },
  {
    "id": "sea-20342-0",
    "code": "PAEN",
    "bounds": [
      -209.75,
      282.54,
      -204.54,
      288.05
    ],
    "rings": [
      [
        [
          [
            -206.6,
            288.05
          ],
          [
            -205.68,
            287.67
          ],
          [
            -205.08,
            287.06
          ],
          [
            -204.71,
            286.1
          ],
          [
            -204.54,
            284.85
          ],
          [
            -204.95,
            283.87
          ],
          [
            -205.69,
            283.05
          ],
          [
            -206.43,
            282.56
          ],
          [
            -207.63,
            282.54
          ],
          [
            -208.74,
            283.08
          ],
          [
            -209.24,
            283.53
          ],
          [
            -209.72,
            284.58
          ],
          [
            -209.75,
            285.68
          ],
          [
            -209.38,
            286.75
          ],
          [
            -208.55,
            287.67
          ],
          [
            -207.79,
            288.01
          ],
          [
            -206.6,
            288.05
          ]
        ]
      ]
    ],
    "cameraVolumes": [
      {
        "ring": [
          [
            -206.6,
            288.05
          ],
          [
            -205.68,
            287.67
          ],
          [
            -205.08,
            287.06
          ],
          [
            -204.71,
            286.1
          ],
          [
            -204.54,
            284.85
          ],
          [
            -204.95,
            283.87
          ],
          [
            -205.69,
            283.05
          ],
          [
            -206.43,
            282.56
          ],
          [
            -207.63,
            282.54
          ],
          [
            -208.74,
            283.08
          ],
          [
            -209.24,
            283.53
          ],
          [
            -209.72,
            284.58
          ],
          [
            -209.75,
            285.68
          ],
          [
            -209.38,
            286.75
          ],
          [
            -208.55,
            287.67
          ],
          [
            -207.79,
            288.01
          ]
        ],
        "bottom": [
          0,
          0,
          12.502018215572113
        ],
        "top": [
          0.033907518423021255,
          -0.01706315406652692,
          31.693143840253388
        ]
      }
    ],
    "replaceCanonicalFootprint": true,
    "source": "/art-v0130/models/pab-east-sites/PAEN-exterior-near-v1.glb",
    "sourceSha256": "5f451f217bcef393da25f6a6cd06fca0e1d0ec18cc63b02d7775674a0a288110"
  }
]) BUILDING_ACCESS.collisionFootprints.push(site);
}

if(BUILDING_ACCESS.geometryHash==="e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d"){
 BUILDING_ACCESS.collisionFootprints.push({
  "id": "sea-68504-0",
  "code": "CPGO",
  "source": "/art-v0130/models/cpg-entry/CPG-whole-entry-near-v4.glb",
  "sourceSha256": "3df564a169e00bc68c7d888e189f1de1801e234f7145517a18269158504b41ca",
  "bounds": [
    -295.1,
    -78.13,
    -266.2,
    -59.58
  ],
  "rings": [
    [
      [
        [
          -272.85,
          -77.77
        ],
        [
          -274.15,
          -76.95
        ],
        [
          -275.05,
          -76.03
        ],
        [
          -275.62,
          -74.65
        ],
        [
          -275.83,
          -72.96
        ],
        [
          -275.58,
          -70.76
        ],
        [
          -275.01,
          -69.11
        ],
        [
          -273.84,
          -67.84
        ],
        [
          -271.95,
          -66.79
        ],
        [
          -269.99,
          -67.01
        ],
        [
          -268.83,
          -67.4
        ],
        [
          -267.55,
          -68.34
        ],
        [
          -266.59,
          -70.03
        ],
        [
          -266.2,
          -72.36
        ],
        [
          -266.42,
          -74.32
        ],
        [
          -267.04,
          -75.8
        ],
        [
          -268.49,
          -77.17
        ],
        [
          -269.7,
          -77.74
        ],
        [
          -270.74,
          -78
        ],
        [
          -272.85,
          -77.77
        ]
      ]
    ],
    [
      [
        [
          -295.1,
          -78.13
        ],
        [
          -274.9,
          -78.13
        ],
        [
          -274.9,
          -59.58
        ],
        [
          -295.1,
          -59.58
        ]
      ]
    ]
  ],
  "cameraVolumes": [
    {
      "ring": [
        [
          -272.85,
          -77.77
        ],
        [
          -274.15,
          -76.95
        ],
        [
          -275.05,
          -76.03
        ],
        [
          -275.62,
          -74.65
        ],
        [
          -275.83,
          -72.96
        ],
        [
          -275.58,
          -70.76
        ],
        [
          -275.01,
          -69.11
        ],
        [
          -273.84,
          -67.84
        ],
        [
          -271.95,
          -66.79
        ],
        [
          -269.99,
          -67.01
        ],
        [
          -268.83,
          -67.4
        ],
        [
          -267.55,
          -68.34
        ],
        [
          -266.59,
          -70.03
        ],
        [
          -266.2,
          -72.36
        ],
        [
          -266.42,
          -74.32
        ],
        [
          -267.04,
          -75.8
        ],
        [
          -268.49,
          -77.17
        ],
        [
          -269.7,
          -77.74
        ],
        [
          -270.74,
          -78
        ],
        [
          -272.85,
          -77.77
        ]
      ],
      "bottom": [
        0,
        0,
        28.5
      ],
      "top": [
        0.06843138550400814,
        -0.002005525339619396,
        51.90187160733085
      ]
    },
    {
      "ring": [
        [
          -277.37,
          -78.13
        ],
        [
          -274.9,
          -78.13
        ],
        [
          -274.9,
          -59.58
        ],
        [
          -277.37,
          -59.58
        ]
      ],
      "bottom": [
        0,
        0,
        28.86
      ],
      "top": [
        0,
        0,
        31.11
      ]
    },
    {
      "ring": [
        [
          -295.1,
          -78.53999999999999
        ],
        [
          -274.9,
          -78.53999999999999
        ],
        [
          -274.9,
          -78.11
        ],
        [
          -295.1,
          -78.11
        ]
      ],
      "bottom": [
        0,
        0,
        25.0
      ],
      "top": [
        0,
        0,
        31.11
      ]
    },
    {
      "ring": [
        [
          -295.1,
          -59.6
        ],
        [
          -274.9,
          -59.6
        ],
        [
          -274.9,
          -59.17
        ],
        [
          -295.1,
          -59.17
        ]
      ],
      "bottom": [
        0,
        0,
        25.0
      ],
      "top": [
        0,
        0,
        31.11
      ]
    }
  ],
  "replaceCanonicalFootprint": true
});
 BUILDING_ACCESS.buildings.push({
  "id": "sea-68504-0",
  "placement": {
    "x": -271.01,
    "z": -72.66,
    "angle": 0,
    "groundY": 31.1
  },
  "rails": [],
  "surfaces": [
    {
      "kind": "stair",
      "axis": "x",
      "highAt": "max",
      "x": [
        -1.660000000000025,
        0.9300000000000068
      ],
      "z": [
        -8.960000000000008,
        -5.890000000000001
      ],
      "count": 8,
      "bottom": -0.6400000000000006,
      "top": 0.09999999999999787
    },
    {
      "kind": "ramp",
      "axis": "x",
      "x": [
        -6.439999999999998,
        -1.660000000000025
      ],
      "z": [
        -8.960000000000008,
        -5.890000000000001
      ],
      "startHeight": -1.1700000000000017,
      "endHeight": -0.6400000000000006
    },
    {
      "kind": "ramp",
      "axis": "x",
      "x": [
        0.9300000000000068,
        5.9599999999999795
      ],
      "z": [
        -8.960000000000008,
        -5.890000000000001
      ],
      "startHeight": 0.09999999999999787,
      "endHeight": 0.3099999999999987
    }
  ],
  "outdoorArrival": {
    "point": [
      -265.44,
      -80.12
    ],
    "pathId": "uw-35-100-19"
  }
});
}
