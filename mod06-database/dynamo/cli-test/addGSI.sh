aws dynamodb update-table \
    --table-name Employee \
    --attribute-definitions AttributeName=FirstName,AttributeType=S  \
    --global-secondary-index-updates \
        "[
            {
                \"Create\": {
                    \"IndexName\": \"FirstName-index\",
                    \"KeySchema\": [{\"AttributeName\":\"FirstName\",\"KeyType\":\"HASH\"}],
                    \"Projection\":{
                        \"ProjectionType\":\"INCLUDE\",
                        \"NonKeyAttributes\":[\"Skills\"]
                    },
                    \"ProvisionedThroughput\": {
                        \"ReadCapacityUnits\":  5,
                        \"WriteCapacityUnits\": 5
                    }
                }
            }
        ]"