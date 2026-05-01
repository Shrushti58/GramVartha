const assert = require("node:assert/strict");
const {
  irrigationScore,
  irrigationAdvice,
  soilMoistureEstimate,
  evaporationIndex,
  diseaseRisk,
  sprayAdvice,
  isRainExpectedInNextHours,
} = require("../modules/farming/farming.engine");
const farmingService = require("../modules/farming/farming.service");

async function run() {
  let passed = 0;

  const check = (name, fn) => {
    fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  };

  const checkAsync = async (name, fn) => {
    await fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  };

  check("irrigationScore follows weighted rules + crop config", () => {
    const score = irrigationScore({
      temp: 36,
      humidity: 35,
      windSpeed: 11,
      rainProb: 10,
      rainMM: 0,
      crop: "rice",
    });
    assert.equal(score, 6);
  });

  check("irrigationAdvice maps score to WATER_REQUIRED", () => {
    assert.equal(irrigationAdvice(3), "WATER_REQUIRED");
  });

  check("irrigationAdvice maps score to LIGHT_WATERING", () => {
    assert.equal(irrigationAdvice(2), "LIGHT_WATERING");
  });

  check("irrigationAdvice maps score to DO_NOT_WATER", () => {
    assert.equal(irrigationAdvice(0), "DO_NOT_WATER");
  });

  check("soilMoistureEstimate returns WET", () => {
    assert.equal(soilMoistureEstimate({ rainMM: 11 }), "WET");
  });

  check("soilMoistureEstimate returns MODERATE", () => {
    assert.equal(soilMoistureEstimate({ rainMM: 4 }), "MODERATE");
  });

  check("soilMoistureEstimate returns DRY", () => {
    assert.equal(soilMoistureEstimate({ rainMM: 1 }), "DRY");
  });

  check("evaporationIndex returns HIGH", () => {
    assert.equal(evaporationIndex({ temp: 36, humidity: 35 }), "HIGH");
  });

  check("evaporationIndex returns MEDIUM", () => {
    assert.equal(evaporationIndex({ temp: 29, humidity: 70 }), "MEDIUM");
  });

  check("diseaseRisk returns HIGH", () => {
    assert.equal(diseaseRisk({ humidity: 85, temp: 25 }), "HIGH");
  });

  check("diseaseRisk returns MEDIUM", () => {
    assert.equal(diseaseRisk({ humidity: 65, temp: 35 }), "MEDIUM");
  });

  check("sprayAdvice returns AVOID_SPRAY", () => {
    assert.equal(sprayAdvice({ windSpeed: 16 }), "AVOID_SPRAY");
  });

  check("rain detection identifies rain in next 6 hours", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const list = [
      { dt: nowSec + 2 * 3600, pop: 0.7, rain: { "3h": 1 } },
      { dt: nowSec + 8 * 3600, pop: 0.2, rain: { "3h": 0 } },
    ];
    assert.equal(isRainExpectedInNextHours(list, 6), true);
  });

  await checkAsync("service uses DELAY_WATERING override when rain is expected", async () => {
    farmingService.__cache.clear();
    process.env.OPENWEATHER_API_KEY = "test-key";

    const nowSec = Math.floor(Date.now() / 1000);
    const mockHttpClient = {
      get: async () => ({
        data: {
          list: [
            {
              dt: nowSec + 3600,
              main: { temp: 35, humidity: 45 },
              pop: 0.7,
              rain: { "3h": 2 },
              wind: { speed: 2 },
            },
            {
              dt: nowSec + 7200,
              main: { temp: 34, humidity: 50 },
              pop: 0.2,
              rain: { "3h": 0 },
              wind: { speed: 2 },
            },
          ],
        },
      }),
    };

    const result = await farmingService.getFarmingAdvice(
      { lat: 18.52, lon: 73.85, crop: "wheat", soilType: "black" },
      { httpClient: mockHttpClient }
    );

    assert.equal(result.irrigation.advice, "DELAY_WATERING");
    assert.ok(Array.isArray(result.insights));
  });

  await checkAsync("service cache avoids duplicate provider calls", async () => {
    farmingService.__cache.clear();
    process.env.OPENWEATHER_API_KEY = "test-key";

    let calls = 0;
    const nowSec = Math.floor(Date.now() / 1000);
    const mockHttpClient = {
      get: async () => {
        calls += 1;
        return {
          data: {
            list: [
              {
                dt: nowSec + 9 * 3600,
                main: { temp: 29, humidity: 55 },
                pop: 0.1,
                rain: { "3h": 0 },
                wind: { speed: 2 },
              },
            ],
          },
        };
      },
    };

    await farmingService.getFarmingAdvice(
      { lat: 18.52, lon: 73.85, crop: "cotton", soilType: "red" },
      { httpClient: mockHttpClient }
    );
    await farmingService.getFarmingAdvice(
      { lat: 18.52, lon: 73.85, crop: "cotton", soilType: "red" },
      { httpClient: mockHttpClient }
    );

    assert.equal(calls, 1);
  });

  console.log(`\nAll farming tests passed (${passed} checks).`);
}

run().catch((error) => {
  console.error("Farming tests failed:", error.message);
  process.exit(1);
});
