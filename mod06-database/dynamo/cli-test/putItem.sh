echo "[+] Adding item to Employee table with LoginName 'sebs'"
aws dynamodb put-item \
    --table-name Employee \
    --item "{
                \"LoginAlias\": {\"S\": \"sebs\"}, 
                \"ManagerLoginAlias\": {\"S\": \"marthar\"}, 
                \"FirstName\": {\"S\": \"Sebastiano\"}, 
                \"LastName\": {\"S\": \"Rossi\"}, 
                \"Skills\": {\"L\": [{ \"S\": \"devops\"}, {\"S\":\"machine learning\"}]}
            }"
if [ $? -eq 0 ]
then
    echo "[+] Item successfully added"
fi