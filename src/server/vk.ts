/* eslint-disable */
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/index";

interface VkProfile {
  response: Array<{
    id: number;
    first_name: string;
    last_name: string;
    photo_100: string;
    can_access_closed: boolean;
    is_closed: boolean;
  }>;
}

export default function VK<P extends Record<string, any> = VkProfile>(
  options: OAuthUserConfig<P>,
): OAuthConfig<P> {
  const apiVersion = "5.126"; // https://vk.com/dev/versions

  return {
    id: "vk",
    name: "VK",
    type: "oauth",
    authorization: `https://oauth.vk.com/authorize?scope=email&v=${apiVersion}`,
    token: {
      url: `https://oauth.vk.com/access_token?v=${apiVersion}`,
      async request({ client, params, checks, provider }) {
        // exclude user_id and email from response
        const { user_id, email, ...tokens } = await client.oauthCallback(
          provider.callbackUrl,
          params,
          checks,
          {
            exchangeBody: {
              client_id: options.clientId,
              client_secret: options.clientSecret,
            },
          },
        );

        return { tokens };
      },
    },
    userinfo: `https://api.vk.com/method/users.get?fields=photo_200&v=${apiVersion}`,
    profile(result: P) {
      const profile = result.response?.[0] ?? {};

      return {
        id: profile.id,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" "),
        email: null,
        image: profile.photo_200,
      };
    },
    options,
  };
}
