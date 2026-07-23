export async function handler(event: { httpMethod?: string; body?: string }) {
  const method = event.httpMethod || 'GET';
  console.log(`[Producer Lambda] Request method: ${method}`);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Producer Lambda function working properly',
      method,
    }),
  };
}
