const { z: Z } = require("zod");
const S = require("superstruct");
const T = require("..");

const typed = T.object({
  data: T.object({
    launchesPast: T.array(
      T.object({
        mission_name: T.string,
        launch_date_local: T.string,
        launch_site: T.object({
          site_name_long: T.string,
        }),
        links: T.object({
          article_link: T.nullable(T.string),
          video_link: T.string,
        }),
        rocket: T.object({
          rocket_name: T.string,
          first_stage: T.object({
            cores: T.array(
              T.object({
                flight: T.number,
                core: T.object({
                  reuse_count: T.number,
                  status: T.nullable(T.string),
                }),
              }),
            ),
          }),
          second_stage: T.object({
            payloads: T.array(
              T.object({
                payload_type: T.string,
                payload_mass_kg: T.nullable(T.number),
                payload_mass_lbs: T.nullable(T.number),
              }),
            ),
          }),
        }),
        ships: T.array(
          T.object({
            name: T.string,
            home_port: T.string,
            image: T.string,
          }),
        ),
      }),
    ),
  }),
});

const superstruct = S.object({
  data: S.object({
    launchesPast: S.array(
      S.object({
        mission_name: S.string(),
        launch_date_local: S.string(),
        launch_site: S.object({
          site_name_long: S.string(),
        }),
        links: S.object({
          article_link: S.nullable(S.string()),
          video_link: S.string(),
        }),
        rocket: S.object({
          rocket_name: S.string(),
          first_stage: S.object({
            cores: S.array(
              S.object({
                flight: S.number(),
                core: S.object({
                  reuse_count: S.number(),
                  status: S.nullable(S.string()),
                }),
              }),
            ),
          }),
          second_stage: S.object({
            payloads: S.array(
              S.object({
                payload_type: S.string(),
                payload_mass_kg: S.nullable(S.number()),
                payload_mass_lbs: S.nullable(S.number()),
              }),
            ),
          }),
        }),
        ships: S.array(
          S.object({
            name: S.string(),
            home_port: S.string(),
            image: S.string(),
          }),
        ),
      }),
    ),
  }),
});

const zod = Z.object({
  data: Z.object({
    launchesPast: Z.array(
      Z.object({
        mission_name: Z.string(),
        launch_date_local: Z.string(),
        launch_site: Z.object({
          site_name_long: Z.string(),
        }),
        links: Z.object({
          article_link: Z.nullable(Z.string()),
          video_link: Z.string(),
        }),
        rocket: Z.object({
          rocket_name: Z.string(),
          first_stage: Z.object({
            cores: Z.array(
              Z.object({
                flight: Z.number(),
                core: Z.object({
                  reuse_count: Z.number(),
                  status: Z.nullable(Z.string()),
                }),
              }),
            ),
          }),
          second_stage: Z.object({
            payloads: Z.array(
              Z.object({
                payload_type: Z.string(),
                payload_mass_kg: Z.nullable(Z.number()),
                payload_mass_lbs: Z.nullable(Z.number()),
              }),
            ),
          }),
        }),
        ships: Z.array(
          Z.object({
            name: Z.string(),
            home_port: Z.string(),
            image: Z.string(),
          }),
        ),
      }),
    ),
  }),
});

module.exports = {
  typed,
  superstruct,
  zod,
};
