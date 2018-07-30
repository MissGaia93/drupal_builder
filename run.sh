echo " ___________________________"
echo "|                           |"
echo "|         run.sh            |"
echo "|    by Rachel Stafford     |"
echo "|    Building your sites    |"
echo "|   So you don't have to    |"
echo "|___________________________|"
echo ""
echo "This script may ask for sudo permissions."
echo "_________________________________________"

#Get file directory (may not necessarily be the same as the terminal's current directory!)
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

if [ $# -eq 0 ]; then
    echo "USAGE:"
    echo "Run a site: run.sh [sitename] up"
    echo "Run a site down: run.sh [sitename] down"
    echo "Rebuild database: "
    exit 1
fi

if [ $2 == "down" ] || [ $2 == "up" ]; then
    echo "Bringing down $1.test"
    eval "docker-compose down"
    if [ $2 == "down" ]; then
        exit 1
    fi
fi



if [ "$EUID" == 0 ]
  then echo "Please don't run as root. The script will ask for sudo permissions if it needs it."
  exit
fi

#TODO Have this run from a different directory so it can spool up multiple sites on the same local environment.
#Spool up site, and build database from backup
#eval "docker-compose down"
if [ $2 == "up" ]; then
    echo "Bringing up $1.test in docker!"
    eval "docker-compose up -d"
fi

if [ $2 == "dbr" ] || [ $2 == "up" ]; then
    echo "Rebuilding database for $1.test"
    ar=( $(find $parent_path/db-backups/*.sql) ); #echo "${#ar[@]}"; echo "${ar[1]}"

    count=1

    echo ""
    echo "List of possible databases:"

    for line in ${ar[@]}; do
      #echo "$count. $line"
      echo "$count. $line"
      count=$(($count+1))
    done
    read -p "select database # to use: " database
    echo ""

    fullfiledbname=${ar[$database-1]}
    dbname=$(basename $fullfiledbname)
    eval "docker-compose exec mariadb sh -c 'cd /var/lib/mysql/backups; mysql -u root -p -C drupaldb < $dbname'"
fi
