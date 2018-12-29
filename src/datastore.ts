import * as AWS from "aws-sdk";
import * as Bluebird from "bluebird";
import { Commit } from "./commit";
import { Datastore } from "./timeline";

const tableName = "changelog";

export const defaultStore = async (
  dynamodb: AWS.DynamoDB
): Promise<Datastore> => {
  return dynamodb
    .describeTable({ TableName: tableName })
    .promise()
    .catch(err =>
      err.code !== "ResourceNotFoundException"
        ? Promise.reject(err)
        : dynamodb
            .createTable({
              TableName: tableName,
              AttributeDefinitions: [
                {
                  AttributeName: "timeline",
                  AttributeType: "S"
                },
                {
                  AttributeName: "timestamp",
                  AttributeType: "N"
                }
              ],
              KeySchema: [
                {
                  AttributeName: "timeline",
                  KeyType: "HASH"
                },
                {
                  AttributeName: "timestamp",
                  KeyType: "RANGE"
                }
              ],
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
              }
            })
            .promise()
    )
    .then(() =>
      dynamodb.waitFor("tableExists", { TableName: tableName }).promise()
    )
    .then(
      (): Datastore => {
        const client = new AWS.DynamoDB.DocumentClient({ service: dynamodb });
        return {
          fetch: id =>
            client
              .query({
                TableName: tableName,
                KeyConditionExpression: "timeline = :id",
                ExpressionAttributeValues: {
                  ":id": id.toString()
                }
              })
              .promise()
              .then(result => result.Items as Commit[]),

          insert: async (_id, commits) => {
            if (commits.length === 0) {
              return Promise.resolve([]);
            }
            return Bluebird.each(commits, commit =>
              client
                .put({
                  TableName: tableName,
                  Item: commit,
                  ReturnValues: "NONE"
                })
                .promise()
            ).then(() => commits);
          }
        };
      }
    );
};
