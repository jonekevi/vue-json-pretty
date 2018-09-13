export class sqlGeneratorService {
  query = '';
  resultObject = [];
  myprint = function (d, parentKey, parentPath, parentJson) {
    if (typeof d !== 'object') {
      this.query += d
      this.query += ' '
      console.log(d)
      return
    }
    for (var k in d) {
      var v = d[k]
      if (typeof v === 'object') {
        if (Object.keys(v).includes('1')) {
          // do nothing. js already orders javascript object.
        }
        if (Object.keys(v).includes('alias')) {
          // special logic for alias, since the keys are NOT in right order
          var aliasKey = v['alias']
          delete v.alias
          if (k === 'table') {
            var includeParentheses = (Object.keys(v).includes('union') || Object.keys(v).includes('select'))
            if (includeParentheses) {
              this.query += '('
              console.log('(')
            }
            v = { 'table': v }
            this.myprint(v, k)
            if (includeParentheses) {
              this.query += ')'
              console.log(')')
            }
          } else {
            this.myprint(v, k)
          }
          this.query += 'as '
          console.log('as ')
          this.myprint(aliasKey, 'alias')
          if ((parentKey === 'select' || parentKey === 'list' || parentKey === 'orderby' || parentKey === 'groupby' || parentKey === 'partition_by' || parentKey === 'assignments') &&
            this.isNotLastElementInObject(d, k)) {
            this.query += ', '
            console.log(', ')
          } else if (parentKey === 'concatenate' && this.isNotLastElementInObject(d, k)) {
            this.query += '||'
            console.log('|| ')
          } else if (parentKey === 'or' && this.isNotLastElementInObject(d, k)) {
            this.query += 'or'
            console.log('or ')
          }
          continue
        }
        if (Object.keys(v).includes('select')) {
          if (k === 'query' || k === 'lookup') {
            this.query += '('
          }
          this.myprint({ 'select': v['select'] }, k)
          if (Object.keys(v).includes('from')) {
            this.myprint({ 'from': v['from'] }, k)
          }
          if (Object.keys(v).includes('where')) {
            this.myprint({ 'where': v['where'] }, k)
          }
          if (Object.keys(v).includes('groupby')) {
            this.myprint({ 'groupby': v['groupby'] }, k)
          }
          if (Object.keys(v).includes('having')) {
            this.myprint({ 'having': v['having'] }, k)
          }
          if (Object.keys(v).includes('orderby')) {
            this.myprint({ 'orderby': v['orderby'] }, k)
          }
          if (Object.keys(v).includes('limit')) {
            this.myprint({ 'limit': v['limit'] }, k)
          }
          if (k === 'query' || k === 'lookup') {
            this.query += ') '
          }
        } else if (k === 'select' || k === 'where' || k === 'not' || k === 'having' || k === 'on') {
          this.query += k
          this.query += ' '
          console.log(k)
          this.myprint(v, k)
        } else if (k === 'from') {
          this.query += k
          this.query += ' '
          if (Object.keys(v).includes('table')) {
            this.myprint(v, k)
          } else if (Object.keys(v).includes('join')) {
            this.myprint({ 'join': v['join'] }, k)
            if (Object.keys(v).includes('extension')) {
              this.myprint({ 'extension': v['extension'] }, k)
            }
          }
        } else if (k === 'parentheses') {
          this.query += '('
          console.log('(')
          this.myprint(v, k)
          this.query += ') '
          console.log(') ')
        } else if (k === 'calc') {
          this.myprint(v['left'], k)
          this.myprint(v['operator'], k)
          this.myprint(v['right'], k)
        } else if (k === 'table') {
          if (Object.keys(v).includes('schema')) {
            this.myprint(v['schema'], k)
            this.query = this.query.substring(0, this.query.length - 1)
            this.query += '.'
            console.log('.')
          }
          if (Object.keys(v).includes('table')) {
            this.myprint(v['table'], k)
          } else {
            this.myprint(v, k)
          }
        } else if (k === 'in') {
          this.myprint(v['item'], k)
          if (Object.keys(v).includes('in_list')) {
            this.query += k
            this.query += ' '
            console.log(k)
          } else if (Object.keys(v).includes('not_in_list')) {
            this.query += 'not in '
            console.log('not in ')
          }
          this.query += '('
          console.log('(')
        } else if (k === 'concatenate') {
          this.myprint(v, k)
        } else if (k === 'condition') {
          this.myprint(v['left'], k)
          this.myprint(v['operator'], k)
          if (Object.keys(v).includes('right')) {
            this.myprint(v['right'], k)
          }
        } else if (k === 'substitution') {
          this.myprint(v['name'], k)
        } else if (k === 'or') {
          this.myprint(v, k)
        } else if (k === 'list') {
          this.myprint(v, k)
        } else if (k === 'column') {
          if (Object.keys(v).includes('table_ref')) {
            if (v['table_ref'] !== '*') {
              this.myprint(v['table_ref'], 'table_ref')
              // remove extra space
              this.query = this.query.substring(0, this.query.length - 1)
              this.query += '.'
              console.log('.')
            }
          }
          if (Object.keys(v).includes('name')) {
            this.myprint(v['name'], 'name')
          }
          if (Object.keys(v).includes('substitution')) {
            this.myprint(v['substitution']['name'], 'substitution')
          }
        } else if (k === 'function') {
          if (v['function_name'] === 'trim') {
            this.query += 'trim('
            console.log('trim(')
            if (Object.keys(v['parameters']).includes('qualifier')) {
              this.myprint(v['parameters']['qualifier'], 'qualifier')
            }
            if (Object.keys(v['parameters']).includes('trim_character')) {
              this.myprint(v['parameters']['trim_character'], 'trim_character')
            }
            if (Object.keys(v['parameters']).includes('value')) {
              this.query += 'from('
              console.log('from(')
              this.myprint(v['parameters']['value'], 'value')
            }
            if (Object.keys(v['parameters']).includes('1')) {
              this.myprint(v['parameters']['1'], '1')
            }
            if (Object.keys(v['parameters']).includes('2')) {
              this.myprint(v['parameters']['2'], '2')
            }
            this.query += ') '
            console.log(') ')
          } else if ((v['function_name'] === 'COALESCE')) {
            this.query += 'COALESCE('
            console.log('COALESCE(')
            if (Object.keys(v['parameters']).includes('1')) {
              this.myprint(v['parameters']['1'], '1')
            }
            if (Object.keys(v['parameters']).includes('2')) {
              this.query += ', '
              console.log(', ')
              this.myprint(v['parameters']['2'], '2')
            }
            this.query += ') '
            console.log(') ')
          } else if ((v['function_name'] === 'unix_timestamp')) {
            this.myprint(v['function_name'], k)
            this.query += '() '
            console.log('() ')
          } else {
            this.query += v['function_name']
            this.query += '('
            console.log('(')
            if (v['parameters'] === '*') {
              this.query += '*'
              console.log('*')
            } else {
              for (key in v['parameters']) {
                var value = v['parameters'][key]
                this.myprint(key, value)
                if (this.isNotLastElementInObject(v['parameters'], key)) {
                  this.query += ', '
                  console.log(', ')
                }
              }
            }
          }
        } else if (k === 'case') {
          this.query += 'case '
          console.log('case')
          for (key in v['clauses']) {
            this.query += 'when '
            console.log('when ')
            this.myprint(value['when'], 'when')
            this.query += 'then '
            console.log('then ')
            this.myprint(value['then'], 'then')
          }
          this.query += 'else'
          console.log('else')
          this.myprint(v['else'], 'else')
          this.query += 'end '
          console.log('end ')
        } else if (k === 'orderby') {
          this.query += 'order by'
          console.log('order by ')
          this.myprint(v, 'orderby')
        } else if (k === 'groupby') {
          this.query += 'group by '
          console.log('group by')
          this.myprint(v, 'groupby')
        } else if (k === 'partition_by') {
          this.query += 'partition by '
          console.log('partition by')
          this.myprint(v, 'partition_by')
        } else if (k === 'window_function') {
          if (Object.keys(v).includes('function')) {
            this.myprint({ 'function': v['function'] }, 'window_function')
          }
          if (Object.keys(v).includes('over')) {
            this.query += 'over ('
            console.log('over (')
            if (Object.keys(v['over']).includes('partition_by')) {
              this.myprint({ 'partition_by': v['over']['partition_by'] }, 'over')
            }
            if (Object.keys(v['over']).includes('orderby')) {
              this.myprint({ 'orderby': v['over']['orderby'] }, 'over')
            }
            this.query += ') '
            console.log(') ')
          }
        } else if (k === 'intersect') {
          this.myprint(v, 'intersect')
        } else if (k === 'union') {
          if (Object.keys(v).includes('union')) {
            v = v['union']
          }
          if (Object.keys(v).includes('1')) {
            this.myprint(v['1'], '1')
            this.query += 'union '
            console.log('union ')
          }
          if (Object.keys(v).includes('2')) {
            this.query += v['2']['union']['qualifier']
            this.query += ' '
            console.log(v['2']['union']['qualifier'])
          }
          if (Object.keys(v).includes('3')) {
            this.myprint(v['3'], '3')
          }
        } else if (k === 'lookup') {
          this.query += '('
          console.log('(')
          this.myprint(v, 'query')
          this.query += ') '
          console.log(') ')
        } else if (k === 'join') {
          var previousJoin = false
          for (key in v) {
            var jv = v[key]
            if (Object.keys(v).includes('join')) {
              var joinType = 'join '
              var joinValue = jv['join']
              if (joinValue === 'left') {
                joinType = 'left join'
              } else if (joinValue === 'right') {
                joinType = 'right join'
              } else if (joinValue === 'inner') {
                joinType = 'inner join'
              } else if (joinValue === 'outer') {
                joinType = 'outer join '
              } else if (joinValue === 'leftouter') {
                joinType = 'left outer join '
              } else if (joinValue === 'rightouter') {
                joinType = 'right outer join '
              } else if (joinValue === 'fullouter') {
                joinType = 'full outer join '
              }
              this.query = this.query.substring(0, this.query.length - 2)
              this.query += joinType
              console.log(joinType)
              previousJoin = true
            } else {
              this.myprint(value, key)
              if (previousJoin) {
                if (Object.keys(v[key - 1]).includes('on')) {
                  this.query += 'on'
                  console.log('on')
                  this.myprint(v[key - 1]['on'])
                }
                if (this.isNotLastElementInObject(v, key)) {
                  this.query += ', '
                  console.log(', ')
                }
                previousJoin = false
              }
            }
          }
        } else if (k === 'between') {
          if (Object.keys(v).includes('item')) {
            this.myprint(v['item'], 'item')
          }
          if (Object.keys(v).includes('operator')) {
            this.myprint(v['operator'], 'operator')
          }
          if (Object.keys(v).includes('symmetry')) {
            this.myprint(v['symmetry'], 'symmetry')
          }
          if (Object.keys(v).includes('begin')) {
            this.myprint(v['begin'], 'begin')
          }
          if (Object.keys(v).includes('end')) {
            this.query += 'and '
            console.log('and ')
            this.myprint(v['end'], 'end')
          }
        } else if (k.startsWith('update')) {
          this.query += 'update'
          console.log('update')
          this.myprint(v, k)
        } else if (k === 'assignments') {
          this.query += 'set '
          console.log('set ')
          this.myprint(v, k)
        } else if (k === 'set') {
          this.myprint(v, k)
          this.query += '='
          console.log('=')
        } else if (k === 'with') {
          this.query += k
          this.query += ' '
          console.log(k)
          for (var key in v) {
            var withValue = v[key]
            this.query += key
            console.log(key)
            this.query += ' as ('
            console.log(' as (')
            this.myprint(withValue, key)
            this.query += ') '
            console.log(')')
            if (this.isNotLastElementInObject(v, key)) {
              this.query += ', '
              console.log(', ')
            }
          }
        } else {
          this.myprint(v, k)
        }
      } else {
        if (k === 'function_name' && v === 'unix_timestamp') {
          this.query += v
          this.query += '() '
          console.log('() ')
        } else {
          this.query += v
          this.query += ' '
          console.log(v)
        }
      }

      if (((parentKey === 'select' || parentKey === 'list' || parentKey === 'join' || parentKey === 'orderby' || parentKey === 'groupby' || parentKey === 'partition_by' || parentKey === 'assignments')) && this.isNotLastElementInObject(d, k)) {
        this.query += ', '
        console.log(', ')
      } else if (parentKey === 'concatenate' && this.isNotLastElementInObject(d, k)) {
        this.query += '|| '
      } else if (parentKey === 'or' && this.isNotLastElementInObject(d, k)) {
        this.query += 'or '
        console.log('or ')
      } else if (parentKey === 'and' && this.isNotLastElementInObject(d, k)) {
        this.query += 'and '
        console.log('and ')
      }
    }
  }
  generateSql (adjacencyMatrix) {
    this.query = ''
    this.myprint(adjacencyMatrix, null, '', this.resultObject)
    console.log(this.query)
    console.log(this.resultObject)
    return this.query
  }

  isNotLastElementInObject (d, k) {
    return d[Object.keys(d)[Object.keys(d) - 1]] !== d[k]
  }
}
