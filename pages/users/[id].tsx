import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { QueryClient } from '@tanstack/react-query'
import { grpcClient, restClient, graphqlClient } from '../../lib/user'
import { UserByIdDocument, UserByIdQuery } from '../../graphql/simple-gql'

type User = { [key: string]: any }

export const getServerSideProps: GetServerSideProps<{
  user: User
}> = async ({ query }) => {
  let user: User = {}

  if (query.protocol == 'grpc') {
    await new Promise<void>((resolve, reject) => {
      grpcClient.getUser({id: Number(query.id)}, (error, response) => {
          if (error) {
            return reject(error)
          }
          user = JSON.parse(JSON.stringify(response))
          resolve()
        }
      )
    })
  } else if (query.protocol == 'graphql') {
    const response = await new QueryClient().fetchQuery(['userById'], async () => {
      return graphqlClient<UserByIdQuery>(UserByIdDocument, { id: 1 })
    })
    user = JSON.parse(JSON.stringify(response.data.userById))
  } else {
    user = (await restClient.getUser(Number(query.id)))
  }
  return {
    props: {
      user
    }
  }
}

export default function Page({
  user
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <ul>
      <li key={user.id}>{user.email}</li>
    </ul>
  )
}
