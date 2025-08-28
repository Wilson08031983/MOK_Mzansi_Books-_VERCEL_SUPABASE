const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/accounting/ExpensesTab.tsx');

try {
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Get the section with the map function
  const mapStart = content.indexOf('filteredExpenses.map(expense => (');
  const mapEnd = content.indexOf(')) : (', mapStart);
  const mapSection = content.substring(mapStart, mapEnd + 2);
  
  console.log(`Found map section from line ${mapStart} to ${mapEnd}`);
  
  // Create a completely restructured map function
  const newMapSection = `filteredExpenses.map(expense => (
                    <React.Fragment key={expense.id}>
                      <tr 
                        className={\`group hover:bg-slate-800/30 cursor-pointer transition-colors \${selectedExpense === expense.id ? 'bg-slate-800/30' : ''}\`}
                        onClick={() => toggleExpenseDetails(expense.id)}
                      >
                        <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedExpensesForBulkProject.includes(expense.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpensesForBulkProject([...selectedExpensesForBulkProject, expense.id]);
                              } else {
                                setSelectedExpensesForBulkProject(selectedExpensesForBulkProject.filter(id => id !== expense.id));
                              }
                            }}
                            className="rounded border-white/10 bg-slate-900/40"
                          />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-sm text-slate-100 font-sf-pro">{new Date(expense.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-400 font-sf-pro">{expense.id}</div>
                          {expense.source === 'bank_statement' && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">Bank Import</Badge>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-100 font-sf-pro">{expense.description}</div>
                        </td>
                        {viewMode === 'bank_statement' && (
                          <>
                            <td className="py-3 px-4 text-right">
                              <div className="text-sm font-medium text-slate-900 font-sf-pro">
                                {expense.debit != null ? formatCurrency(expense.debit) : '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="text-sm font-medium text-mokm-green-600 font-sf-pro">
                                {expense.credit != null ? formatCurrency(expense.credit) : '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="text-sm font-medium text-slate-700 font-sf-pro">
                                {expense.balance != null ? formatCurrency(expense.balance) : '-'}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {editingCategory === expense.id ? (
                            <Select
                              value={\`\${expense.category}|\${expense.notes?.includes('Subcategory:') ? expense.notes.replace('Subcategory: ', '') : ''}\`}
                              onValueChange={(value) => handleInlineCategoryUpdate(expense.id, value)}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setEditingCategory(null);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {expenseCategories.map(category => (
                                  <SelectGroup key={category.name}>
                                    <SelectLabel>{category.name}</SelectLabel>
                                    <SelectItem value={\`\${category.name}|\`}>{category.name}</SelectItem>
                                    {category.subcategories?.map(subcategory => (
                                      <SelectItem key={subcategory} value={\`\${category.name}|\${subcategory}\`}>
                                        &nbsp;&nbsp;&nbsp;{subcategory}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div 
                              className="flex items-center cursor-pointer" 
                              onClick={() => setEditingCategory(expense.id)}
                            >
                              <div className="text-sm text-slate-300 mr-2 font-sf-pro">
                                {expense.category || 'Uncategorized'}
                                {expense.notes?.includes('Subcategory:') && (
                                  <span className="text-xs text-slate-400 block">
                                    {expense.notes.replace('Subcategory: ', '')}
                                  </span>
                                )}
                              </div>
                              <Pencil className="h-3 w-3 text-slate-400" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-sm font-medium font-sf-pro">
                            {expense.amount !== undefined ? formatCurrency(expense.amount) : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-sf-pro">
                            {expense.paymentMethod || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost" 
                              className="h-7 w-7 bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditExpense(expense);
                              }}
                              title="Edit expense"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost" 
                              className="h-7 w-7 bg-rose-900/20 hover:bg-rose-900/40 text-rose-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExpense(expense.id);
                              }}
                              title="Delete expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                          </div>
                        </td>
                      </tr>
                      {selectedExpense === expense.id && (
                        <tr>
                          <td colSpan={viewMode === 'bank_statement' ? 12 : 9} className="p-0">
                            <div className="glass backdrop-blur-sm bg-slate-900/40 p-4 border-t border-b border-white/10">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-slate-300 mb-3 font-sf-pro">Details</h4>
                                  <div className="text-sm space-y-2">
                                    <div className="flex justify-between items-center py-3 px-4 glass backdrop-blur-sm bg-slate-900/30 rounded-lg border border-white/10 shadow-sm">
                                      <span className="text-slate-300 font-medium text-xs uppercase tracking-wide">Submitted by:</span>
                                      <span className="font-sf-pro text-slate-100 font-semibold text-right">
                                        {user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                                          ? \`\${user.user_metadata.first_name} \${user.user_metadata.last_name}\` 
                                          : user?.user_metadata?.full_name || user?.email || 'Unknown User'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 px-4 glass backdrop-blur-sm bg-slate-900/30 rounded-lg border border-white/10 shadow-sm">
                                      <span className="text-slate-300 font-medium text-xs uppercase tracking-wide">Submitted date:</span>
                                      <span className="font-sf-pro text-slate-100 font-semibold text-right">
                                        {(() => {
                                          if (expense.bankStatementId) {
                                            const bankStatement = bankStatements.find(bs => bs.id === expense.bankStatementId);
                                            return bankStatement?.uploadDate 
                                              ? new Date(bankStatement.uploadDate).toLocaleDateString()
                                              : new Date(expense.submittedDate).toLocaleDateString();
                                          }
                                          return new Date(expense.submittedDate).toLocaleDateString();
                                        })()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 px-4 glass backdrop-blur-sm bg-slate-900/30 rounded-lg border border-white/10 shadow-sm">
                                      <span className="text-slate-300 font-medium text-xs uppercase tracking-wide">Receipt:</span>
                                      <span className="font-sf-pro text-slate-100 font-semibold text-right">
                                        {expense.receiptUrl ? (
                                          <Button 
                                            size="sm"
                                            variant="link" 
                                            className="px-0 h-auto font-normal text-mokm-blue-400"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(expense.receiptUrl, '_blank');
                                            }}
                                          >
                                            View Receipt
                                          </Button>
                                        ) : (
                                          <span className="text-slate-400">No receipt</span>
                                        )}
                                      </span>
                                    </div>
                                    {expense.projectId && (
                                      <div className="py-3 px-4 glass backdrop-blur-sm bg-slate-900/30 rounded-lg border border-white/10 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-slate-300 font-medium text-xs uppercase tracking-wide">Project:</span>
                                          <Badge variant="secondary" className="font-sf-pro text-xs">
                                            {projects.find(p => p.id === expense.projectId)?.name || 'Unknown Project'}
                                          </Badge>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-white/5">
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-400 text-xs">Project Budget:</span>
                                            <span className="font-sf-pro text-slate-300 text-sm">
                                              {formatCurrency(projects.find(p => p.id === expense.projectId)?.budget || 0)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-medium text-slate-300 mb-2 font-sf-pro mt-4">Actions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline" 
                                      className="h-8 text-xs border-white/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUploadReceiptModalOpen(expense);
                                      }}
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      Upload Receipt
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline" 
                                      className="h-8 text-xs border-white/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerifyReceiptModalOpen(expense);
                                      }}
                                      disabled={!expense.receiptUrl}
                                    >
                                      <Receipt className="h-3 w-3 mr-1" />
                                      Verify Receipt
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  {expense.projectId && (
                                    <div>
                                      <h4 className="text-sm font-medium text-slate-300 mb-2 font-sf-pro">Project Budget</h4>
                                      <div className="glass backdrop-blur-sm bg-slate-900/30 rounded-lg border border-white/10 shadow-sm p-3 mb-4">
                                        <ProjectBudgetChart project={projects.find(p => p.id === expense.projectId)} />
                                      </div>
                                    </div>
                                  )}
                                  <h4 className="text-sm font-medium text-slate-300 mb-2 font-sf-pro">Actions</h4>
                                </div>
                                
                                <div>
                                  {expense.notes && (
                                    <>
                                      <h4 className="text-sm font-medium text-slate-700 mb-2 font-sf-pro">Notes</h4>
                                      <p className="text-sm text-slate-600 bg-white/50 p-2 rounded font-sf-pro">
                                        {expense.notes}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))`;
  
  // Replace the map section in the content
  const updatedContent = content.substring(0, mapStart) + newMapSection + content.substring(mapEnd + 2);
  
  // Write the fixed content back
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('Successfully replaced the map function with a correctly structured version');
} catch (error) {
  console.error('Error fixing JSX structure:', error);
}
