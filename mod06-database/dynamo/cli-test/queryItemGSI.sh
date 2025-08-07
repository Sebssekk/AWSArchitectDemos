if [ "$(pwd | awk '{n=split($1,path,"/");print path[n]}')" != 'cli-test' ]
then
    echo "[X] Please ensure you are in mod07/cli-test folder.."
    echo "[X] Your current path is $(pwd)"
    exit
fi

echo "[+] Reading from DynamoDB table Employee"
echo "[+] Reading entries with FirstName = 'Jane' thanks to GSI"

aws dynamodb query \
    --table-name Employee \
    --key-condition-expression "FirstName = :fn " \
    --expression-attribute-values file://./expression-attributes/gsi.json \
    --index FirstName-index \
    --return-consumed-capacity TOTAL