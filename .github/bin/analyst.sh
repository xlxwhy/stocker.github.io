#!/bin/bash
# for github workflow

BASEDIR=$(cd "$(dirname "$0")";pwd) ;

## function

checkEmpty(){
    return `ls -A $1|wc -w`
}

npm run github:analyst

files="$BASEDIR/../../data/temp/analyst-*.html"

# move analyst result files
if checkEmpty "$files" ; then
    echo "No analyst result~!"
else 
    mv $files  $BASEDIR/../../data/stock/analyst/
fi

