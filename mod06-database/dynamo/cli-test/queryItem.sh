if [ "$(pwd | awk '{n=split($1,path,"/");print path[n]}')" != 'cli-test' ]
then
    echo "[X] Please ensure you are in mod07/cli-test folder.."
    echo "[X] Your current path is $(pwd)"
    exit
fi

echo "[+] Reading from DynamoDB table Employee"
echo "[+] Reading entries with LoaginAlias = 'diegor"
aws dynamodb query \
    --table-name Employee \
    --key-condition-expression "LoginAlias = :la " \
    --expression-attribute-values file://./expression-attributes/common.json \
    --return-consumed-capacity TOTAL

echo "[+] Same read but filtering on Skills containing 'executive assistant'"
aws dynamodb query \
    --table-name Employee \
    --key-condition-expression "LoginAlias = :la " \
    --filter-expression "contains (Skills, :sk)" \
    --expression-attribute-values file://./expression-attributes/filter.json \
    --return-consumed-capacity TOTAL



