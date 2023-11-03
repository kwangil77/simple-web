import { credentials } from '@grpc/grpc-js'
import axios from 'axios'
import { print, DocumentNode } from 'graphql'
import { ApiClient } from '../openapi/simple-rest'
import { UserClient } from '../proto/simple-grpc'

export const restClient = new ApiClient({
  BASE: process.env.REST_SIMPLE_API_URL
}).userController

export const grpcClient = new UserClient(
  process.env.GRPC_SIMPLE_API_ADDR || '',
  process.env.GRPC_SIMPLE_API_TLS_ENABLED === 'true' ? credentials.createSsl() : credentials.createInsecure()
)

export const graphqlClient = <T = unknown>(query: DocumentNode, variables: any = {}) => {
  return axios({
    url: process.env.GRAPHQL_SIMPLE_API_URL,
    method: 'post',
    data: {
      query: print(query),
      variables,
    },
  }).then((res) => {
    return res.data;
  }) as Promise<{ data: T; errors?: Error[] }>
}