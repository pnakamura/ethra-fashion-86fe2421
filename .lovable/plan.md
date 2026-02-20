

# Configure MONITORING_API_KEY Secret

## What will be done

Add the **MONITORING_API_KEY** secret to the project so the `admin-monitoring` Edge Function can authenticate requests.

## How it works

The `admin-monitoring` function already checks for this secret:

```text
Header received:  x-monitoring-key: <your_value>
Compared against:  Deno.env.get("MONITORING_API_KEY")
```

If they match, the request proceeds. Otherwise, a 401 Unauthorized is returned.

## Steps

1. Use the secrets tool to prompt you for the `MONITORING_API_KEY` value
2. Deploy the `admin-monitoring` function so it picks up the new secret
3. Test the endpoint with a curl call

## Recommendation

Generate a strong random string (32+ characters). You can use:

```text
openssl rand -hex 32
```

This will produce something like `a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1`

