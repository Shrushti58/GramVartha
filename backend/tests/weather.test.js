const assert = require("node:assert/strict");
const { getWaterAdvice } = require("../modules/weather/weather.utils");
const weatherService = require("../modules/weather/weather.service");

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

  check("DO_NOT_WATER when rain probability is high", () => {
    const advice = getWaterAdvice({
      temp: 30,
      humidity: 50,
      rainProb: 71,
      rainMM: 1,
      month: 1,
    });
    assert.equal(advice, "DO_NOT_WATER");
  });

  check("DO_NOT_WATER during monsoon with rain probability > 60", () => {
    const advice = getWaterAdvice({
      temp: 31,
      humidity: 55,
      rainProb: 61,
      rainMM: 0.2,
      month: 8,
    });
    assert.equal(advice, "DO_NOT_WATER");
  });

  check("WATER_REQUIRED for hot and dry weather", () => {
    const advice = getWaterAdvice({
      temp: 37,
      humidity: 35,
      rainProb: 20,
      rainMM: 0,
      month: 2,
    });
    assert.equal(advice, "WATER_REQUIRED");
  });

  check("LIGHT_WATERING for high humidity", () => {
    const advice = getWaterAdvice({
      temp: 27,
      humidity: 82,
      rainProb: 15,
      rainMM: 0,
      month: 11,
    });
    assert.equal(advice, "LIGHT_WATERING");
  });

  check("NORMAL_WATERING for balanced conditions", () => {
    const advice = getWaterAdvice({
      temp: 29,
      humidity: 60,
      rainProb: 20,
      rainMM: 0,
      month: 12,
    });
    assert.equal(advice, "NORMAL_WATERING");
  });

  await checkAsync("Weather service transforms mocked API response", async () => {
    weatherService.__cache.clear();
    process.env.OPENWEATHER_API_KEY = "test-key";

    const mockHttpClient = {
      get: async () => ({
        data: {
          current: { temp: 34.2, humidity: 44 },
          hourly: [{ pop: 0.65, rain: { "1h": 2.4 } }],
        },
      }),
    };

    const result = await weatherService.getWeatherAdvice(
      { lat: 18.5204, lon: 73.8567 },
      { httpClient: mockHttpClient }
    );

    assert.equal(result.temperature, 34.2);
    assert.equal(result.humidity, 44);
    assert.equal(result.rainProbability, 65);
    assert.equal(result.rainfall, 2.4);
    assert.ok(result.adviceCode);
  });

  await checkAsync("Weather service cache avoids duplicate provider calls", async () => {
    weatherService.__cache.clear();
    process.env.OPENWEATHER_API_KEY = "test-key";

    let callCount = 0;
    const mockHttpClient = {
      get: async () => {
        callCount += 1;
        return {
          data: {
            current: { temp: 29, humidity: 52 },
            hourly: [{ pop: 0.1, rain: { "1h": 0 } }],
          },
        };
      },
    };

    await weatherService.getWeatherAdvice(
      { lat: 18.52, lon: 73.85 },
      { httpClient: mockHttpClient }
    );
    await weatherService.getWeatherAdvice(
      { lat: 18.52, lon: 73.85 },
      { httpClient: mockHttpClient }
    );

    assert.equal(callCount, 1);
  });

  await checkAsync("Weather service falls back to free-tier endpoints on One Call 401", async () => {
    weatherService.__cache.clear();
    process.env.OPENWEATHER_API_KEY = "test-key";

    let step = 0;
    const mockHttpClient = {
      get: async (url) => {
        step += 1;
        if (step === 1) {
          const authError = new Error("Request failed with status code 401");
          authError.response = { status: 401 };
          throw authError;
        }

        if (url.includes("/data/2.5/weather")) {
          return { data: { main: { temp: 31, humidity: 58 } } };
        }

        return { data: { list: [{ pop: 0.72, rain: { "3h": 6.1 } }] } };
      },
    };

    const result = await weatherService.getWeatherAdvice(
      { lat: 19.07, lon: 72.87 },
      { httpClient: mockHttpClient }
    );

    assert.equal(result.temperature, 31);
    assert.equal(result.humidity, 58);
    assert.equal(result.rainProbability, 72);
    assert.equal(result.rainfall, 6.1);
  });

  console.log(`\nAll weather tests passed (${passed} checks).`);
}

run().catch((error) => {
  console.error("Weather tests failed:", error.message);
  process.exit(1);
});
